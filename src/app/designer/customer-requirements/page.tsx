'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { CustomerRequirement } from '../../../types/designer';
import {
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  Search,
  Download,
  Upload,
  X,
  AlertCircle,
  FileCode,
} from 'lucide-react';

export default function CustomerRequirementsPage() {
  const {
    customerRequirements,
    addCustomerRequirement,
    approveCustomerRequirement,
    designJobs,
    currentUser,
  } = useERP();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReq, setSelectedReq] = useState<CustomerRequirement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedDesignJobId, setSelectedDesignJobId] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [capacity, setCapacity] = useState('');
  const [application, setApplication] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('SS 316L Contact Parts');
  const [powerRequirement, setPowerRequirement] = useState('415V / 50 Hz / 3-Phase');
  const [speed, setSpeed] = useState('');
  const [automationLevel, setAutomationLevel] = useState('Semi-Automatic (PLC Touchscreen)');
  const [controlSystem, setControlSystem] = useState('Siemens S7-1200 PLC + HMI');
  const [safetyRequirements, setSafetyRequirements] = useState('Flameproof Motors & Emergency Stop Switches');
  const [specialRequirements, setSpecialRequirements] = useState('');

  // Close modals with ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeCreateModal();
        if (selectedReq) setSelectedReq(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, selectedReq]);

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setSelectedDesignJobId('');
    setContactPerson('');
    setContactMobile('');
    setCapacity('');
    setApplication('');
    setDimensions('');
    setSpecialRequirements('');
  };

  const filteredReqs = customerRequirements.filter((r) => {
    return (
      r.id?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.jobNumber?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
      r.machineName?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const desJob = designJobs.find((j) => j.id === selectedDesignJobId);
    if (!desJob) return;

    addCustomerRequirement({
      designJobId: desJob.id,
      projectId: desJob.projectId,
      jobNumber: desJob.jobNumber,
      customerName: desJob.customerName,
      contactPerson: contactPerson || 'Mr. Customer Rep',
      contactMobile: contactMobile || '+91 9876543210',
      machineName: desJob.productName,
      machineType: desJob.machineType || 'Process Vessel',
      model: 'UTF-2026-CUSTOM',
      quantity: desJob.quantity,
      capacity: capacity || '10,000 Liters',
      application: application || 'Chemical Reactions',
      productionRequirement: 'Batch Process',
      dimensions: dimensions || '2400mm Dia x 3200mm Height',
      material,
      powerRequirement,
      speed: speed || '48 RPM',
      output: 'High Efficiency',
      automationLevel,
      controlSystem,
      safetyRequirements,
      specialRequirements,
      status: 'under_review',
    });

    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6  text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
              MODULE 3.2
            </span>
            <h1 className="text-2xl font-black text-[#211B17] tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-amber-400" />
              Customer Technical Requirement Specifications
            </h1>
          </div>
          <p className="text-xs text-[#70665F] mt-1">
            Machine Technical Parameters, Dimensions, Materials, Electrical Specs & Customer Approval
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#211B17] text-xs font-bold shadow-lg shadow-amber-600/30 transition"
        >
          <Plus className="w-4 h-4" />
          Add Requirement Sheet
        </button>
      </div>

      {/* Control Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#EBE3DB] flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search Job #, Customer, Machine Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-[#EBE3DB] text-xs text-[#211B17] placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReqs.map((req) => (
          <div
            key={req.id}
            className="p-5 rounded-2xl bg-white border border-[#EBE3DB] hover:border-amber-500/40 transition space-y-4 shadow-xl relative"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-xs text-amber-400">{req.id}</span>
                <span className="font-mono text-xs text-[#70665F] ml-2">[{req.jobNumber}]</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  req.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {req.status?.replace(/_/g, ' ')?.toUpperCase()}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-[#211B17] text-sm">{req.machineName}</h3>
              <p className="text-xs text-[#70665F]">{req.customerName} ({req.contactPerson})</p>
            </div>

            {/* Technical Parameters Quick Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3DB] font-mono">
              <div>
                <span className="text-[10px] text-[#70665F] block">CAPACITY</span>
                <span className="text-[#3E2723]">{req.capacity}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">CONTACT MATERIAL</span>
                <span className="text-amber-300 font-bold">{req.material}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">DIMENSIONS</span>
                <span className="text-[#3E2723]">{req.dimensions}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#70665F] block">CONTROL SYSTEM</span>
                <span className="text-[#3E2723]">{req.controlSystem}</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-[#EBE3DB] text-xs">
              <button
                onClick={() => setSelectedReq(req)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#544B45] font-semibold transition"
              >
                Full Spec Sheet
              </button>

              {req.status !== 'approved' && (
                <button
                  onClick={() => approveCustomerRequirement(req.id, `${currentUser.firstName} ${currentUser.lastName}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-bold transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Approve Requirement
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredReqs.length === 0 && (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#EBE3DB] space-y-3 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#211B17]">No Customer Technical Requirements Found</h3>
          <p className="text-xs text-[#70665F] max-w-md mx-auto">
            {searchQuery
              ? `No requirement sheets matched "${searchQuery}".`
              : 'There are currently no customer technical requirement specifications in the system.'}
          </p>
        </div>
      )}

      {/* Modal: Add Requirement Sheet */}
      {isModalOpen && (
        <div
          onClick={closeCreateModal}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 p-6"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h3 className="text-base font-extrabold text-[#211B17] flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Add Customer Technical Requirement Sheet
              </h3>
              <button
                type="button"
                onClick={closeCreateModal}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-2">
              <div>
                <label className="text-[#544B45] font-bold block mb-1">Select Design Job *</label>
                <select
                  required
                  value={selectedDesignJobId}
                  onChange={(e) => setSelectedDesignJobId(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Select Design Job --</option>
                  {designJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.designJobNumber} ({j.jobNumber}) - {j.customerName} ({j.productName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Contact Person Name</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. A. K. Sharma"
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Capacity / Output</label>
                  <input
                    type="text"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 10,000 Liters / Batch"
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Contact Parts Material *</label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  >
                    <option value="SS 316L Contact Parts">SS 316L Solid / Clad</option>
                    <option value="SS 304 Contact Parts">SS 304 Grade</option>
                    <option value="IS 2062 Grade B Mild Steel">Mild Steel IS 2062</option>
                    <option value="Hastelloy C-276 Special Alloy">Hastelloy C-276</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Dimensions (L x W x H)</label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder="e.g. 2400mm Dia x 3200mm Height"
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Automation Level</label>
                  <input
                    type="text"
                    value={automationLevel}
                    onChange={(e) => setAutomationLevel(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[#544B45] font-bold block mb-1">Control System Spec</label>
                  <input
                    type="text"
                    value={controlSystem}
                    onChange={(e) => setControlSystem(e.target.value)}
                    className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#544B45] font-bold block mb-1">Safety & Compliance Notes</label>
                <textarea
                  rows={2}
                  value={safetyRequirements}
                  onChange={(e) => setSafetyRequirements(e.target.value)}
                  className="w-full bg-white border border-[#EBE3DB] rounded-xl px-3 py-2 text-[#211B17] focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-[#211B17] font-bold cursor-pointer"
                >
                  Save Spec Sheet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Full Spec Modal */}
      {selectedReq && (
        <div
          onClick={() => setSelectedReq(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-4 p-6 text-xs max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <div>
                <span className="font-mono font-bold text-amber-400 text-sm">{selectedReq.id}</span>
                <h3 className="text-base font-extrabold text-[#211B17] mt-0.5">{selectedReq.machineName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#FAF7F2] p-4 rounded-xl border border-[#EBE3DB] font-mono">
              <div>
                <span className="text-[#70665F] block">Job Number:</span>
                <span className="font-bold text-crm-brand-500">{selectedReq.jobNumber}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Customer Name:</span>
                <span className="font-bold text-[#211B17]">{selectedReq.customerName}</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Contact Person:</span>
                <span className="text-[#544B45]">{selectedReq.contactPerson} ({selectedReq.contactMobile})</span>
              </div>
              <div>
                <span className="text-[#70665F] block">Capacity / Application:</span>
                <span className="text-[#544B45]">{selectedReq.capacity} ({selectedReq.application})</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-[#211B17] uppercase tracking-wider text-xs border-b border-[#EBE3DB] pb-1">
                Detailed Technical Specifications
              </h4>
              <div className="grid grid-cols-2 gap-3 text-[#544B45]">
                <div><span className="text-[#70665F] font-bold">Dimensions:</span> {selectedReq.dimensions}</div>
                <div><span className="text-[#70665F] font-bold font-mono">Material:</span> {selectedReq.material}</div>
                <div><span className="text-[#70665F] font-bold">Power Spec:</span> {selectedReq.powerRequirement}</div>
                <div><span className="text-[#70665F] font-bold">Speed / RPM:</span> {selectedReq.speed}</div>
                <div><span className="text-[#70665F] font-bold">Automation:</span> {selectedReq.automationLevel}</div>
                <div><span className="text-[#70665F] font-bold">Control System:</span> {selectedReq.controlSystem}</div>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                <span className="text-[#70665F] font-bold block">Safety & Compliance:</span>
                <p className="text-[#544B45] mt-1">{selectedReq.safetyRequirements}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-xl bg-white text-[#544B45] font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
