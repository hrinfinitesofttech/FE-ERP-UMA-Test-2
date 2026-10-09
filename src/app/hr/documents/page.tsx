'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
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

export interface DocumentTypeMasterItem {
  id: string;
  typeName: string;
  category: 'Identity' | 'Academic' | 'Professional' | 'Financial' | 'Medical' | 'Legal';
  isMandatory: boolean;
  allowMultiple: boolean;
  status: 'Active' | 'Inactive';
}

const DOCUMENT_TYPE_MASTER: DocumentTypeMasterItem[] = [
  { id: 'DOC-TYP-01', typeName: 'Aadhaar Card (12 Digits)', category: 'Identity', isMandatory: true, allowMultiple: false, status: 'Active' },
  { id: 'DOC-TYP-02', typeName: 'PAN Card (10 Characters)', category: 'Identity', isMandatory: true, allowMultiple: false, status: 'Active' },
  { id: 'DOC-TYP-03', typeName: 'Educational Degree / Diploma Certificate', category: 'Academic', isMandatory: true, allowMultiple: true, status: 'Active' },
  { id: 'DOC-TYP-04', typeName: 'Previous Experience Certificate', category: 'Professional', isMandatory: false, allowMultiple: true, status: 'Active' },
  { id: 'DOC-TYP-05', typeName: 'Bank Passbook / Cancelled Cheque', category: 'Financial', isMandatory: true, allowMultiple: false, status: 'Active' },
  { id: 'DOC-TYP-06', typeName: 'Medical Fitness Certificate', category: 'Medical', isMandatory: false, allowMultiple: false, status: 'Active' },
  { id: 'DOC-TYP-07', typeName: 'Resume / Curriculum Vitae (CV)', category: 'Professional', isMandatory: true, allowMultiple: false, status: 'Active' },
  { id: 'DOC-TYP-08', typeName: 'Appointment Letter', category: 'Legal', isMandatory: true, allowMultiple: false, status: 'Active' },
  { id: 'DOC-TYP-09', typeName: 'Joining Letter / Relieving Letter', category: 'Legal', isMandatory: false, allowMultiple: true, status: 'Active' },
  { id: 'DOC-TYP-10', typeName: 'Driving License / Passport / Voter ID', category: 'Identity', isMandatory: false, allowMultiple: false, status: 'Active' },
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

  // Document types list from Master
  const documentTypesList = useMemo(() => {
    return DOCUMENT_TYPE_MASTER.filter((dt) => dt.status === 'Active');
  }, []);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Build employee list
  const employeeList = useMemo(() => {
    if (availableEmployees && availableEmployees.length > 0) {
      return availableEmployees.map((e) => ({
        id: e.id,
        name: e.name || `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Employee',
        department: e.department || e.departmentName || 'General',
      }));
    }
    return [];
  }, [availableEmployees]);

  const [formData, setFormData] = useState({
    employeeId: '',
    documentType: 'Aadhaar Card (12 Digits)' as any,
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    remarks: '',
  });

  const uploadedTypesForSelectedEmployee = useMemo(() => {
    if (!formData.employeeId) return new Set<string>();
    const uploaded = employeeDocuments
      .filter((d) => d.employeeId === formData.employeeId)
      .map((d) => (d.documentType || '').toLowerCase());
    return new Set(uploaded);
  }, [employeeDocuments, formData.employeeId]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirmDoc, setDeleteConfirmDoc] = useState<EmployeeDocumentItem | null>(null);

  // Check if Upload form has user-entered changes
  const isUploadFormDirty = useMemo(() => {
    return (
      formData.documentNumber.trim() !== '' ||
      formData.issueDate !== '' ||
      formData.expiryDate !== '' ||
      formData.remarks.trim() !== '' ||
      selectedFile !== null
    );
  }, [formData, selectedFile]);

  // Close modals on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUploadModal) closeUploadModalWithConfirm();
        if (deleteConfirmDoc) setDeleteConfirmDoc(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUploadModal, deleteConfirmDoc, isUploadFormDirty]);

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setFormErrors({});
    setSelectedFile(null);
    setSelectedFileName('');
    setSelectedFileSize('');
    setFilePreviewUrl('');
    setFormData({
      employeeId: employeeList[0]?.id || 'EMP-001',
      documentType: 'Aadhaar',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      remarks: '',
    });
  };

  const closeUploadModalWithConfirm = () => {
    if (isUploadFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        closeUploadModal();
      }
    } else {
      closeUploadModal();
    }
  };

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
    setFormErrors({});
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

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];

  const processFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFormErrors((prev) => ({
        ...prev,
        file: 'Unsupported file format. Please upload a PDF, JPG, PNG, or DOC file.',
      }));
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFormErrors((prev) => ({
        ...prev,
        file: `File size exceeds the 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller file.`,
      }));
      return;
    }

    setSelectedFile(file);
    setSelectedFileName(file.name);
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setSelectedFileSize(`${sizeInMB} MB`);
    const objectUrl = URL.createObjectURL(file);
    setFilePreviewUrl(objectUrl);
    setFormErrors((prev) => ({ ...prev, file: '' }));
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

  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;

    if (formData.documentType === 'Aadhaar') {
      // Keep digits only, max 12
      const digitsOnly = inputVal.replace(/\D/g, '').slice(0, 12);
      // Format with a space after every 4 digits: e.g. 1234 5678 9012
      const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
      setFormData({ ...formData, documentNumber: formatted });
    } else if (formData.documentType === 'PAN') {
      // Keep uppercase letters & numbers only, max 10
      const cleanPan = inputVal.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      setFormData({ ...formData, documentNumber: cleanPan });
    } else {
      setFormData({ ...formData, documentNumber: inputVal.slice(0, 25) });
    }

    if (formErrors.documentNumber) {
      setFormErrors((prev) => ({ ...prev, documentNumber: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.employeeId) {
      errors.employeeId = 'Please select an employee.';
    }

    const docNum = formData.documentNumber.trim();
    if (!docNum) {
      errors.documentNumber = 'Document number is required and cannot be blank.';
    } else {
      if (formData.documentType === 'Aadhaar') {
        const cleanAadhaar = docNum.replace(/\s+/g, '');
        if (!/^\d{12}$/.test(cleanAadhaar)) {
          errors.documentNumber = 'Aadhaar must be exactly 12 digits (e.g. 1234 5678 9012).';
        }
      } else if (formData.documentType === 'PAN') {
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(docNum)) {
          errors.documentNumber = 'PAN must be in valid format with 10 characters (e.g. ABCDE1234F).';
        }
      } else if (docNum.length > 25) {
        errors.documentNumber = 'Document number cannot exceed 25 characters.';
      }
    }

    if (!selectedFile && !filePreviewUrl) {
      errors.file = 'Please upload/attach a document file (PDF, JPG, PNG, DOC, DOCX).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const emp = employeeList.find((e) => e.id === formData.employeeId) || employeeList[0];
    const docUrl = filePreviewUrl || `/docs/${formData.documentType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    // Remove spaces before saving for consistent database storage
    const storedDocNumber =
      formData.documentType === 'Aadhaar'
        ? formData.documentNumber.replace(/\s+/g, '')
        : formData.documentNumber.trim();

    addEmployeeDocument({
      employeeId: emp.id,
      employeeName: emp.name,
      documentType: formData.documentType,
      documentNumber: storedDocNumber,
      issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate || '',
      fileUrl: docUrl,
      verificationStatus: 'Pending',
      remarks: formData.remarks?.trim() || (selectedFileName ? `Attached: ${selectedFileName}` : 'Uploaded document verification request'),
    });

    closeUploadModal();
  };

  const confirmDelete = () => {
    if (deleteConfirmDoc) {
      deleteEmployeeDocument(deleteConfirmDoc.id);
      setDeleteConfirmDoc(null);
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
            <option value="Pending">Pending Review</option>
            <option value="Rejected">Rejected / Expired</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3DB] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#544B45]">
            <thead className="bg-[#FAF7F2] text-[#70665F] font-mono text-[11px] uppercase tracking-wider border-b border-[#EBE3DB]">
              <tr>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Document Type</th>
                <th className="p-3.5">Document Number</th>
                <th className="p-3.5">Issue / Expiry</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#70665F]">
                    No employee documents match the selected filters. Click &quot;Upload Document&quot; to add records.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const isVerified = doc.verificationStatus === 'Verified';
                  const isRejected = doc.verificationStatus === 'Rejected';

                  // Format Aadhaar display with spaces for clean readability
                  const displayDocNumber =
                    doc.documentType === 'Aadhaar' && doc.documentNumber && doc.documentNumber.replace(/\D/g, '').length === 12
                      ? doc.documentNumber.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
                      : doc.documentNumber;

                  return (
                    <tr key={doc.id} className="hover:bg-[#FAF7F2]/60 transition">
                      <td className="p-3.5 font-bold text-[#211B17]">
                        <div>{doc.employeeName}</div>
                        <div className="text-[10px] text-[#70665F] font-mono">{doc.employeeId}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45]">
                          {doc.documentType}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#211B17]">
                        {displayDocNumber}
                      </td>
                      <td className="p-3.5 text-[#544B45]">
                        <div>Issued: {doc.issueDate || '2026-01-01'}</div>
                        <div className="text-[10px] text-[#70665F]">
                          {doc.expiryDate ? `Expires: ${doc.expiryDate}` : 'Lifetime Valid'}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : isRejected
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : isRejected ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-crm-brand-700 hover:bg-crm-brand-50 rounded-lg transition"
                              title="Download/View Document"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                          {doc.verificationStatus === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateEmployeeDocumentStatus(doc.id, 'Verified')}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                                title="Approve & Mark Verified"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateEmployeeDocumentStatus(doc.id, 'Rejected')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Reject Document"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setDeleteConfirmDoc(doc)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDoc && (
        <div
          onClick={() => setDeleteConfirmDoc(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#211B17]">Delete Document?</h3>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Are you sure you want to remove {deleteConfirmDoc.documentType} ({deleteConfirmDoc.documentNumber})?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#EBE3DB]">
              <button
                type="button"
                onClick={() => setDeleteConfirmDoc(null)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal (With backdrop close and unsaved changes confirmation) */}
      {showUploadModal && (
        <div
          onClick={closeUploadModalWithConfirm}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Upload className="w-5 h-5 text-crm-brand-700" /> Upload Employee Document
              </h2>
              <button
                type="button"
                onClick={closeUploadModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Select Employee *</label>
                <select
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-medium focus:outline-none focus:border-crm-brand-600"
                >
                  {employeeList.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
                {formErrors.employeeId && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{formErrors.employeeId}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#544B45] mb-1">Document Type *</label>
                {documentTypesList.length === 0 ? (
                  <p className="text-[11px] text-rose-600 font-semibold p-2 bg-rose-50 rounded-lg">
                    The document types could not be loaded. Please try again.
                  </p>
                ) : (
                  <select
                    value={formData.documentType}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      const isExp = ['Medical Fitness Certificate', 'Driving License', 'Passport', 'Visa / Work Permit', 'Insurance Policy'].some((t) => newType.includes(t));
                      setFormData({
                        ...formData,
                        documentType: newType,
                        documentNumber: '',
                        expiryDate: isExp ? formData.expiryDate : '',
                      });
                      setFormErrors({});
                    }}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] font-medium focus:outline-none focus:border-crm-brand-600"
                  >
                    {documentTypesList.map((dt) => {
                      const isAlreadyUploaded =
                        uploadedTypesForSelectedEmployee.has(dt.typeName.toLowerCase()) ||
                        uploadedTypesForSelectedEmployee.has(dt.typeName.split(' ')[0].toLowerCase());
                      return (
                        <option
                          key={dt.id}
                          value={dt.typeName}
                          disabled={isAlreadyUploaded && !dt.allowMultiple}
                        >
                          {dt.typeName} {isAlreadyUploaded ? (dt.allowMultiple ? '— (Uploaded • Add Another)' : '✓ (Already Uploaded)') : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">
                    Document Number *
                    <span className="text-[10px] text-[#70665F] font-normal ml-1">
                      ({formData.documentType === 'Aadhaar' ? '12 digits with auto-spacing' : formData.documentType === 'PAN' ? '10 alphanumeric' : 'Max 25 chars'})
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={formData.documentType === 'Aadhaar' ? 14 : formData.documentType === 'PAN' ? 10 : 25}
                    placeholder={
                      formData.documentType === 'Aadhaar'
                        ? 'e.g. 1234 5678 9012'
                        : formData.documentType === 'PAN'
                        ? 'e.g. ABCDE1234F'
                        : 'e.g. DEG-2026-889'
                    }
                    value={formData.documentNumber}
                    onChange={handleDocumentNumberChange}
                    className={`w-full px-3 py-2 bg-[#FAF7F2] border rounded-xl text-[#211B17] font-mono font-medium focus:outline-none ${
                      formErrors.documentNumber ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-crm-brand-600'
                    }`}
                  />
                  {formErrors.documentNumber && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">{formErrors.documentNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Expiry Date</label>
                  {['Medical Fitness', 'Driving License', 'Passport', 'Visa / Work Permit', 'Insurance Policy', 'Contract / Agreement'].includes(formData.documentType) ? (
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-600"
                    />
                  ) : (
                    <div className="w-full px-3 py-2 bg-[#F3ECE4]/70 border border-[#EBE3DB] rounded-xl text-[11px] text-[#70665F] font-semibold flex items-center gap-1.5 h-[38px]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Lifetime / No Expiry Applicable</span>
                    </div>
                  )}
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
                      : formErrors.file
                      ? 'border-rose-500 bg-rose-50/30'
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
                        className="p-1 text-rose-500 hover:bg-rose-100 rounded-lg ml-2 cursor-pointer"
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
                      <p className="text-[11px] text-[#70665F] mt-1 font-medium">
                        Maximum file size: 5 MB. Allowed file types: PDF, JPG, PNG, DOC, DOCX.
                      </p>
                    </div>
                  )}
                </div>
                {formErrors.file && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">{formErrors.file}</p>
                )}
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
                  onClick={closeUploadModalWithConfirm}
                  className="px-4 py-2 bg-[#FAF7F2] hover:bg-slate-200 text-[#544B45] font-semibold rounded-xl cursor-pointer"
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
