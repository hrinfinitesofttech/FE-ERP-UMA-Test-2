'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function EmployeeDocumentsPage() {
  const { employeeDocuments, addEmployeeDocument, updateEmployeeDocumentStatus, availableEmployees } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: availableEmployees[0]?.id || 'EMP-2026-001',
    documentType: 'Aadhaar' as const,
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    fileUrl: '/docs/document_upload.pdf',
    remarks: '',
  });

  const filteredDocs = employeeDocuments.filter((doc) => {
    const matchesSearch =
      doc.employeeName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      doc.documentNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      doc.documentType?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = availableEmployees.find((e) => e.id === formData.employeeId);
    addEmployeeDocument({
      employeeId: formData.employeeId,
      employeeName: emp?.name || 'Staff Employee',
      documentType: formData.documentType,
      documentNumber: formData.documentNumber || 'DOC-REG-9912',
      issueDate: formData.issueDate || '2022-01-01',
      expiryDate: formData.expiryDate || '2032-01-01',
      fileUrl: formData.fileUrl,
      verificationStatus: 'Pending',
      remarks: formData.remarks || 'Initial document submission',
    });
    setShowUploadModal(false);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-emerald-400" />
            Centralized Employee Document Management
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Verification Repository for Aadhaar, PAN, Degrees, Experience Letters & Expiry Alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold text-sm rounded-lg shadow-md transition"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Expiry Reminder Banner */}
      <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl flex items-center gap-3 text-xs text-amber-200">
        <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div>
          <span className="font-bold">Document Expiry Reminder Alert:</span> 2 Employee passports & medical certificates are due for renewal within 30 days. Reminders sent via automated HR email.
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search by employee, doc number or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBE3DB] rounded-lg text-sm text-[#3E2723] focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-[#70665F]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-2 text-sm text-[#3E2723] focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Document No.</th>
                <th className="p-4">Issue & Expiry Date</th>
                <th className="p-4">Status & Verifier</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#3E2723]">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#FAF7F2]/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-[#211B17]">{doc.employeeName}</div>
                    <div className="text-xs text-[#70665F]">ID: {doc.employeeId}</div>
                  </td>
                  <td className="p-4 font-semibold text-emerald-400">{doc.documentType}</td>
                  <td className="p-4 font-mono text-xs text-[#544B45]">{doc.documentNumber}</td>
                  <td className="p-4 text-xs text-[#70665F]">
                    <div>Issue: {doc.issueDate || 'N/A'}</div>
                    <div>Expiry: {doc.expiryDate || 'No Expiry'}</div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          doc.verificationStatus === 'Verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : doc.verificationStatus === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {doc.verificationStatus === 'Verified' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {doc.verificationStatus}
                      </span>
                      {doc.verifiedBy && <div className="text-[11px] text-[#70665F]">By: {doc.verifiedBy}</div>}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.verificationStatus === 'Pending' && (
                        <button
                          onClick={() => updateEmployeeDocumentStatus(doc.id, 'Verified', 'Sanjay Shah (HR Manager)')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] text-xs font-semibold rounded transition"
                        >
                          Verify
                        </button>
                      )}
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-[#FAF7F2] hover:bg-slate-600 rounded text-[#544B45] transition"
                      >
                        <Download className="w-4 h-4 text-emerald-400" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" /> Upload Employee Document
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#70665F] mb-1">Select Employee *</label>
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

              <div>
                <label className="block text-[#70665F] mb-1">Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Resume">Resume / CV</option>
                  <option value="Educational Degree">Educational Degree</option>
                  <option value="Previous Experience Certificate">Experience Certificate</option>
                  <option value="Joining Letter">Joining Letter</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="Bank Passbook">Bank Passbook / Cheque</option>
                  <option value="Medical Fitness">Medical Fitness Certificate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#70665F] mb-1">Document Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9988-7766-5544"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
                <div>
                  <label className="block text-[#70665F] mb-1">Expiry Date (If applicable)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#70665F] mb-1">File Upload Attachment</label>
                <div className="border-2 border-dashed border-[#EBE3DB] rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500 transition">
                  <Upload className="w-6 h-6 text-[#70665F] mx-auto mb-1" />
                  <span className="text-[#544B45] font-medium">Click to select PDF or Image file</span>
                  <p className="text-[10px] text-[#70665F] mt-1">Supported: PDF, JPG, PNG up to 10MB</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-white text-[#544B45] font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-[#211B17] font-semibold rounded-lg">
                  Upload & Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
