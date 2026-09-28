'use client';

import React, { useState, useRef, useMemo } from 'react';
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
  FileCheck,
  Trash2,
  Check,
  FileQuestion,
  FilePlus,
  Paperclip,
} from 'lucide-react';
import { EmployeeDocumentItem } from '../../../types/hr';

const DEFAULT_EMPLOYEES = [
  { id: 'EMP-001', name: 'Rajesh Patel', department: 'Management' },
  { id: 'EMP-002', name: 'Sanjay Shah', department: 'HR & Payroll' },
  { id: 'EMP-003', name: 'Amit Kumar', department: 'Production' },
  { id: 'EMP-004', name: 'Pooja Mehta', department: 'Accounting & Finance' },
  { id: 'EMP-005', name: 'Vikram Solanki', department: 'Design & Engineering' },
];

export default function EmployeeDocumentsPage() {
  const {
    employeeDocuments,
    addEmployeeDocument,
    deleteEmployeeDocument,
    updateEmployeeDocumentStatus,
    availableEmployees,
    currentUser,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Build employee list with fallbacks
  const employeeList = useMemo(() => {
    if (availableEmployees && availableEmployees.length > 0) {
      return availableEmployees.map((e) => ({
        id: e.id,
        name: e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Employee',
        department: e.department || e.departmentName || 'General',
      }));
    }
    return DEFAULT_EMPLOYEES;
  }, [availableEmployees]);

  const [formData, setFormData] = useState({
    employeeId: '',
    documentType: 'Aadhaar' as EmployeeDocumentItem['documentType'],
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    remarks: '',
  });

  const handleOpenModal = () => {
    const defaultEmpId = employeeList[0]?.id || 'EMP-001';
    setFormData({
      employeeId: defaultEmpId,
      documentType: 'Aadhaar',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      remarks: '',
    });
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setFilePreviewUrl('');
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setSelectedFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setSelectedFileSize(`${sizeInMB} MB`);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employeeList.find((e) => e.id === formData.employeeId) || employeeList[0];
    
    // Fallback file link if none selected
    const docUrl = filePreviewUrl || `/docs/${formData.documentType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    addEmployeeDocument({
      employeeId: emp.id,
      employeeName: emp.name,
      documentType: formData.documentType,
      documentNumber: formData.documentNumber || `DOC-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate || '',
      fileUrl: docUrl,
      verificationStatus: 'Pending',
      remarks: formData.remarks || (selectedFileName ? `Attached: ${selectedFileName}` : 'Uploaded document verification request'),
    });

    setShowUploadModal(false);
  };

  const handleDelete = (id: string, docType: string, empName: string) => {
    if (confirm(`Are you sure you want to delete ${docType} for ${empName}?`)) {
      deleteEmployeeDocument(id);
    }
  };

  const filteredDocs = employeeDocuments.filter((doc) => {
    const matchesSearch =
      !searchTerm?.trim() ||
      doc.employeeName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      doc.documentNumber?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      doc.documentType?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      doc.remarks?.toLowerCase().includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const verifiedCount = employeeDocuments.filter((d) => d.verificationStatus === 'Verified').length;
  const pendingCount = employeeDocuments.filter((d) => d.verificationStatus === 'Pending').length;
  const rejectedCount = employeeDocuments.filter((d) => d.verificationStatus === 'Rejected').length;

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-crm-brand-700" />
            Centralized Employee Document Management
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Verification Repository for Aadhaar, PAN, Degrees, Experience Letters & Expiry Alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3DB]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#70665F]">Total Documents</div>
          <div className="text-2xl font-black text-[#211B17] mt-1">{employeeDocuments.length}</div>
          <div className="text-[10px] text-[#70665F] mt-0.5">Across all departments</div>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3DB]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Verified</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Compliance approved</div>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3DB]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Awaiting HR verification</div>
        </div>

        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE3DB]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Rejected / Expired</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{rejectedCount}</div>
          <div className="text-[10px] text-rose-700 font-semibold mt-0.5">Requires re-submission</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search employee, document no, type or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#70665F]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl px-3 py-2 text-xs text-[#211B17] font-semibold focus:outline-none focus:border-crm-brand-600"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Pending">Pending Verification Only</option>
            <option value="Rejected">Rejected Only</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE3DB] text-[10px] font-bold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Document No.</th>
                <th className="p-4">Issue & Expiry Date</th>
                <th className="p-4">Status & Verifier</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-[#211B17]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#70665F]">
                    No documents found. Click <span className="font-bold text-crm-brand-700">"Upload Document"</span> to add an employee record.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAF7F2]/60 transition">
                    <td className="p-4">
                      <div className="font-bold text-[#211B17]">{doc.employeeName}</div>
                      <div className="text-[11px] font-mono text-[#70665F]">ID: {doc.employeeId}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-crm-brand-700 bg-crm-brand-50 px-2 py-0.5 rounded border border-crm-brand-100">
                        {doc.documentType}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-[#544B45]">{doc.documentNumber}</td>
                    <td className="p-4 text-[11px] text-[#70665F]">
                      <div>Issue: <span className="text-[#211B17] font-medium">{doc.issueDate || 'N/A'}</span></div>
                      <div>Expiry: <span className="text-[#211B17] font-medium">{doc.expiryDate || 'Lifetime / No Expiry'}</span></div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            doc.verificationStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : doc.verificationStatus === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {doc.verificationStatus === 'Verified' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : doc.verificationStatus === 'Pending' ? (
                            <Clock className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {doc.verificationStatus}
                        </span>
                        {doc.verifiedBy && <div className="text-[10px] text-[#70665F]">By: {doc.verifiedBy}</div>}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {doc.verificationStatus === 'Pending' && (
                          <button
                            onClick={() =>
                              updateEmployeeDocumentStatus(
                                doc.id,
                                'Verified',
                                `${currentUser?.name || 'Sanjay Shah'} (HR Manager)`
                              )
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition shadow-sm cursor-pointer"
                            title="Verify Document"
                          >
                            Verify
                          </button>
                        )}
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            download={doc.documentNumber || 'document'}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-[#FAF7F2] hover:bg-slate-200 rounded-lg text-[#544B45] transition"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5 text-crm-brand-700" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(doc.id, doc.documentType, doc.employeeName)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Upload className="w-5 h-5 text-crm-brand-700" /> Upload Employee Document
              </h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-[#70665F] hover:text-[#211B17] font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Select Employee *</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-medium"
                >
                  {employeeList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Document Type *</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-medium"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="Resume">Resume / CV</option>
                  <option value="Educational Degree">Educational Degree</option>
                  <option value="Previous Experience Certificate">Experience Certificate</option>
                  <option value="Joining Letter">Joining Letter</option>
                  <option value="Appointment Letter">Appointment Letter</option>
                  <option value="Bank Passbook">Bank Passbook / Cancelled Cheque</option>
                  <option value="Medical Fitness">Medical Fitness Certificate</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Document Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6508-7587-1888"
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Expiry Date (If applicable)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                  />
                </div>
              </div>

              {/* Hidden Real File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                className="hidden"
              />

              {/* Interactive File Upload Box */}
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">File Attachment *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-crm-brand-600 bg-crm-brand-50'
                      : selectedFileName
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-[#EBE3DB] bg-[#FAF7F2] hover:border-crm-brand-500 hover:bg-white'
                  }`}
                >
                  {selectedFileName ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-[#211B17] text-xs">{selectedFileName}</div>
                        <div className="text-[10px] text-[#70665F]">{selectedFileSize} • Ready to upload</div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setSelectedFileName('');
                          setSelectedFileSize('');
                          setFilePreviewUrl('');
                        }}
                        className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg ml-2"
                        title="Remove file"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-7 h-7 text-crm-brand-700 mx-auto mb-1.5" />
                      <span className="text-[#211B17] font-bold block text-xs">
                        Click to browse file or Drag & Drop here
                      </span>
                      <p className="text-[10px] text-[#70665F] mt-0.5">
                        Supported: PDF, JPG, PNG, DOC up to 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Remarks / Notes</label>
                <input
                  type="text"
                  placeholder="Optional verification notes or tags..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17]"
                />
              </div>

              <div className="pt-3 border-t border-[#EBE3DB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-200 text-[#544B45] font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
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

