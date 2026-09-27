'use client';

import React, { useState } from 'react';
import { useERP } from '../../../context/ERPContext';
import { formatDate } from '../../../lib/utils';
import { ProjectDocument } from '../../../types/crm';
import { Folder, FileText, Upload, Search, Filter, Plus, X, Download } from 'lucide-react';

export default function ProjectDocumentsPage() {
  const { projectDocuments, addProjectDocument, projectJobs } = useERP();

  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectId, setProjectId] = useState('PRJ-2026-0001');
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('Drawing');
  const [version, setVersion] = useState('v1.0');
  const [department, setDepartment] = useState('designer');
  const [relatedRecord, setRelatedRecord] = useState('GA Drawing');
  const [description, setDescription] = useState('');

  const filteredDocs = projectDocuments.filter((d) => {
    if (selectedProjectId !== 'all' && d.projectId !== selectedProjectId) return false;
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery?.toLowerCase();
      return (
        d.documentName?.toLowerCase().includes(q) ||
        d.jobNumber?.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q) ||
        d.uploadedBy?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const prj = projectJobs.find((p) => p.id === projectId) || projectJobs[0];

    addProjectDocument({
      projectId: prj.id,
      jobNumber: prj.jobNumber,
      documentName: docName,
      type: docType,
      version,
      uploadedBy: 'Dharmesh Joshi',
      department,
      relatedRecord: relatedRecord || prj.projectNumber,
      description,
      fileSize: '3.4 MB',
    });

    setIsModalOpen(false);
    setDocName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 text-xs pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-500 font-mono text-[10px] font-bold uppercase tracking-wider border border-teal-500/20">
              Document Vault & Versioning
            </span>
          </div>
          <h1 className="text-lg font-black text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <Folder className="w-5 h-5 text-teal-500" />
            Project Documents Repository
          </h1>
          <p className="text-[#70665F] dark:text-[#70665F] mt-0.5">
            Store and link drawings, BOMs, POs, Test Certificates, and Reports across all departments.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-[#211B17] font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-teal-600/30 transition cursor-pointer"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl border border-slate-200 dark:border-[#EBE3DB] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[#70665F] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents by name, version, job #, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Projects</option>
            {projectJobs.map((p) => (
              <option key={p.id} value={p.id}>{p.projectNumber} ({p.jobNumber})</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-white border border-slate-200 dark:border-[#EBE3DB]/80 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Document Types</option>
            <option value="Drawing">Drawing</option>
            <option value="BOM">BOM</option>
            <option value="PO">Customer PO</option>
            <option value="Certificate">Certificate / MTC</option>
            <option value="QC Report">QC Report</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="bg-white dark:bg-[#0B1120] p-5 rounded-2xl border border-slate-200 dark:border-[#EBE3DB] shadow-md space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-crm-brand-700 dark:text-crm-brand-500 font-bold bg-crm-brand-600/10 px-2 py-0.5 rounded text-[10px] border border-crm-brand-600/20">
                  Version {doc.version}
                </span>
                <span className="text-[10px] font-mono text-[#70665F]">{doc.fileSize || '2.5 MB'}</span>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-xs flex items-start gap-2">
                <FileText className="w-4 h-4 text-crm-brand-600 flex-shrink-0 mt-0.5" />
                <span className="break-all">{doc.documentName}</span>
              </h3>

              <p className="text-[#70665F] text-[11px]">{doc.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-[#EBE3DB] space-y-2 text-[11px]">
              <div className="flex justify-between text-[#70665F] font-mono">
                <span>Type: <strong className="text-slate-700 dark:text-[#544B45]">{doc.type}</strong></span>
                <span>Job: <strong className="text-amber-500">{doc.jobNumber}</strong></span>
              </div>

              <div className="flex justify-between text-[#70665F] font-mono">
                <span>Uploaded By: {doc.uploadedBy}</span>
                <span>{formatDate(doc.uploadDate)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF7F2] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-[#EBE3DB] bg-slate-50 dark:bg-white flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-[#211B17] text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-teal-500" /> Upload Project Document
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded text-[#70665F] hover:bg-slate-100 dark:hover:bg-[#FAF7F2]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Target Project / Job *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                >
                  {projectJobs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectNumber} ({p.jobNumber}) • {p.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Document File Name *</label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. GA_Drawing_SS316L_Reactor_Rev2.pdf"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  >
                    <option value="Drawing">Drawing</option>
                    <option value="BOM">BOM</option>
                    <option value="PO">Customer PO</option>
                    <option value="Certificate">Certificate / MTC</option>
                    <option value="QC Report">QC Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Version</label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="e.g. v1.0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#544B45] mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-300 dark:border-[#EBE3DB] rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-[#EBE3DB] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 dark:bg-[#FAF7F2] text-slate-700 dark:text-[#544B45] font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-[#211B17] font-bold rounded-xl"
                >
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
