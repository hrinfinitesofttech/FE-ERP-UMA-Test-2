'use client';

import React, { useState, useRef } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectDocument } from '../../../types/crm';
import {
  Folder,
  FileText,
  Upload,
  Search,
  Filter,
  Plus,
  X,
  Download,
  Eye,
  FileCode,
  FileCheck,
  CheckCircle2,
  Trash2,
  File,
  Paperclip
} from 'lucide-react';

export default function ProjectDocumentsPage() {
  const { projectDocuments, addProjectDocument, projectJobs, currentUser } = useERP();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState(projectJobs[0]?.id || 'PRJ-2026-0001');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Drawing');
  const [version, setVersion] = useState('v1.0');
  const [department, setDepartment] = useState('Design');
  const [relatedRecord, setRelatedRecord] = useState('GA Drawing');
  const [description, setDescription] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('2.4 MB');
  const [previewDoc, setPreviewDoc] = useState<ProjectDocument | null>(null);

  const filteredDocs = projectDocuments.filter((d) => {
    if (selectedProjectId !== 'all' && d.projectId !== selectedProjectId) return false;
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery?.toLowerCase();
      return (
        d.documentName?.toLowerCase().includes(q) ||
        d.jobNumber?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.uploadedBy?.toLowerCase().includes(q) ||
        d.type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      if (!docName.trim()) {
        setDocName(file.name);
      }
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setSelectedFileSize(`${sizeMB} MB`);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const prj = projectJobs.find((p) => p.id === projectId) || projectJobs[0];
    const uploader = currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Super Admin' : 'Super Admin';

    addProjectDocument({
      projectId: prj?.id || 'PRJ-2026-0001',
      jobNumber: prj?.jobNumber || 'JOB-2026-0001',
      documentName: docName,
      type: docType,
      version: version || 'v1.0',
      uploadedBy: uploader,
      department,
      relatedRecord: relatedRecord || prj?.projectNumber || 'Engineering Archive',
      description: description || 'Project engineering documentation',
      fileSize: selectedFileSize || '2.5 MB',
      fileUrl: selectedFileName ? `/uploads/projects/${selectedFileName}` : undefined,
    });

    setIsModalOpen(false);
    setDocName('');
    setDescription('');
    setSelectedFileName('');
    setSelectedFileSize('2.4 MB');
  };

  const downloadDocument = (doc: ProjectDocument) => {
    const blob = new Blob([`Dummy File Content for ${doc.documentName}\nVersion: ${doc.version}\nProject: ${doc.projectId}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.documentName.endsWith('.pdf') || doc.documentName.endsWith('.dwg') ? doc.documentName : `${doc.documentName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 font-mono text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
              Document Vault & Versioning
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-200">
              <Folder className="w-5 h-5" />
            </div>
            Project Documents & Engineering Vault
          </h1>
          <p className="text-[#70665F] mt-1 text-xs">
            Store, link, and version GA drawings, fabrication BOMs, client POs, Mill Test Certificates (MTC), and QC Inspection Reports.
          </p>
        </div>

        <button
          onClick={() => {
            setDocName('');
            setSelectedFileName('');
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center gap-2 shadow-xs transition cursor-pointer text-xs"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents by name, version, job #, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Projects ({projectJobs.length})</option>
            {projectJobs.map((p) => (
              <option key={p.id} value={p.id}>{p.projectNumber} ({p.jobNumber})</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Document Types</option>
            <option value="Drawing">Drawings & CAD</option>
            <option value="BOM">BOM / Indents</option>
            <option value="PO">Customer PO</option>
            <option value="Certificate">Certificate / MTC</option>
            <option value="QC Report">QC Inspection Report</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-xs space-y-3 flex flex-col justify-between hover:border-teal-500/50 transition">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded text-[10px] border border-teal-200">
                  Version {doc.version || 'v1.0'}
                </span>
                <span className="text-[10px] font-mono text-[#70665F]">{doc.fileSize || '2.5 MB'}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-xs flex items-start gap-2">
                <FileText className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <span className="break-all">{doc.documentName}</span>
              </h3>

              <p className="text-[#70665F] text-[11px] line-clamp-2">{doc.description || 'Verified engineering file'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
              <div className="flex justify-between text-[#70665F] font-mono">
                <span>Type: <strong className="text-slate-800">{doc.type}</strong></span>
                <span>Job: <strong className="text-amber-700">{doc.jobNumber || doc.projectId}</strong></span>
              </div>

              <div className="flex justify-between items-center text-[#70665F] font-mono">
                <span>By: {doc.uploadedBy || 'Super Admin'}</span>
                <span>{formatDate(doc.uploadDate || (doc as any).createdAt || (doc as any).created_at)}</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="px-2.5 py-1 text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg font-semibold flex items-center gap-1 text-[10px] transition"
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
                <button
                  onClick={() => downloadDocument(doc)}
                  className="px-2.5 py-1 text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold flex items-center gap-1 text-[10px] transition"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-[#70665F] space-y-2">
            <Folder className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800">No project documents uploaded yet</h4>
            <p className="text-xs text-slate-500">Click &ldquo;Upload Document&rdquo; to attach drawings, BOMs, or test certificates.</p>
          </div>
        )}
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-600" /> Upload Project Engineering Document
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Project / Job *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white"
                >
                  {projectJobs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} ({p.jobNumber}) • {p.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Real File Picker Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Choose File from Computer *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
                >
                  <Paperclip className="w-6 h-6 text-teal-600" />
                  {selectedFileName ? (
                    <div>
                      <span className="font-bold text-teal-900 block">{selectedFileName}</span>
                      <span className="text-[10px] text-teal-700">Size: {selectedFileSize} • Click to change file</span>
                    </div>
                  ) : (
                    <div>
                      <span className="font-bold text-teal-800 block">Click to Browse Document File</span>
                      <span className="text-[10px] text-[#70665F]">Supported: PDF, DWG, DXF, STEP, XLSX, PNG, DOCX</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Display Name *</label>
                <input
                  type="text"
                  required
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. GA_Drawing_SS316L_Reactor_Rev2.pdf"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white"
                  >
                    <option value="Drawing">Drawing / CAD</option>
                    <option value="BOM">Fabrication BOM</option>
                    <option value="PO">Customer PO</option>
                    <option value="Certificate">Material Test Certificate (MTC)</option>
                    <option value="QC Report">QC Inspection Report</option>
                    <option value="WPS">WPS / PQR Document</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Revision / Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. v1.0 / Rev-02"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-semibold focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Scope, revision change summary or engineering notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-xs"
                >
                  Upload & Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">{previewDoc.documentName}</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-bold text-slate-900">{previewDoc.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Version:</span>
                <span className="font-mono font-bold text-teal-700">{previewDoc.version || 'v1.0'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Job Number:</span>
                <span className="font-mono font-bold text-amber-700">{previewDoc.jobNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Uploaded By:</span>
                <span className="font-semibold text-slate-800">{previewDoc.uploadedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="font-mono text-slate-700">{previewDoc.fileSize || '2.5 MB'}</span>
              </div>
              {previewDoc.description && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">Notes:</span>
                  <p className="text-slate-800">{previewDoc.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => downloadDocument(previewDoc)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download File
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-bold"
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
