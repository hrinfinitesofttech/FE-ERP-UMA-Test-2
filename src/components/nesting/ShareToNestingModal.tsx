'use client';

import React, { useEffect, useState } from 'react';
import { Share2, Upload, FileText } from 'lucide-react';
import { api } from '../../lib/apiClient';
import { toast } from '../../context/ToastContext';
import { ERPModal } from '../ui/ERPModal';
import { btnGhost, btnPrimary, errText, inputCls, labelCls } from './common';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** When opened from a design job, this job is pre-selected. */
  designJobId?: string;
  onShared?: (job: any) => void;
}

const readAsDataUrl = (f: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(f);
  });

/** Design -> Nesting: pick the DXF / PDF / STEP files of a design job and share them. */
export function ShareToNestingModal({ isOpen, onClose, designJobId, onShared }: Props) {
  const [designJobs, setDesignJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState(designJobId || '');
  const [files, setFiles] = useState<any[]>([]);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [uploads, setUploads] = useState<{ fileName: string; fileType: string; fileUrl: string }[]>([]);
  const [priority, setPriority] = useState('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedJob(designJobId || '');
    setUploads([]);
    setRemarks('');
    if (!designJobId) {
      api.get('/design-jobs/').then((r: any) => setDesignJobs(Array.isArray(r) ? r : [])).catch(() => setDesignJobs([]));
    }
  }, [isOpen, designJobId]);

  useEffect(() => {
    if (!isOpen || !selectedJob) {
      setFiles([]);
      return;
    }
    api
      .get(`/nesting/jobs/design-files/?designJobId=${encodeURIComponent(selectedJob)}`)
      .then((r: any) => {
        const list = r?.files || [];
        setFiles(list);
        // pre-select CAD files that a cutting machine can use
        const init: Record<string, boolean> = {};
        list.forEach((f: any) => (init[f.id] = ['DXF', 'DWG', 'PDF', 'STEP', 'STP', 'IGES'].includes(String(f.fileType).toUpperCase())));
        setPicked(init);
      })
      .catch(() => setFiles([]));
  }, [isOpen, selectedJob]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files || []);
    const out: any[] = [];
    for (const f of list) {
      const ext = f.name.includes('.') ? f.name.split('.').pop()!.toUpperCase() : 'FILE';
      out.push({ fileName: f.name, fileType: ext, fileUrl: await readAsDataUrl(f) });
    }
    setUploads((u) => [...u, ...out]);
    e.target.value = '';
  };

  const submit = async () => {
    const fileIds = Object.keys(picked).filter((k) => picked[k]);
    if (!selectedJob) return toast.error('Select a design job first.');
    if (!fileIds.length && !uploads.length) return toast.error('Select or upload at least one file (DXF / PDF / STEP).');
    setBusy(true);
    try {
      const job = await api.post('/nesting/jobs/share-from-design/', {
        designJobId: selectedJob, fileIds, files: uploads, priority, assignedTo, remarks,
      });
      toast.success(`Shared with Nesting: ${job?.nestingNumber || ''}`);
      onShared?.(job);
      onClose();
    } catch (e: any) {
      toast.error(errText(e, 'Could not share files'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ERPModal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Share design files with Nesting"
      subtitle="Nesting downloads these files, loads them in the cutting-machine software and starts cutting."
      icon={<Share2 className="w-4 h-4" />}
      footer={
        <div className="flex justify-end gap-2">
          <button className={btnGhost} onClick={onClose}>Cancel</button>
          <button className={btnPrimary} onClick={submit} disabled={busy}>{busy ? 'Sharing...' : 'Share with Nesting'}</button>
        </div>
      }
    >
      <div className="space-y-4">
        {!designJobId && (
          <div>
            <label className={labelCls}>Design job *</label>
            <select className={inputCls} value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
              <option value="">Select design job...</option>
              {designJobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.designJobNumber} - {j.productName} ({j.customerName})
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelCls}>Files on this design job</label>
          <div className="border border-[color:var(--crm-border-default)] rounded-lg divide-y divide-[color:var(--crm-border-default)] max-h-52 overflow-y-auto">
            {files.length === 0 && (
              <div className="p-3 text-xs text-[color:var(--crm-text-secondary)]">
                {selectedJob ? 'No files are attached to this design job. Upload them below.' : 'Select a design job to see its files.'}
              </div>
            )}
            {files.map((f) => (
              <label key={f.id} className="flex items-center gap-3 p-2.5 text-xs cursor-pointer hover:bg-[color:var(--crm-surface-subtle)]">
                <input type="checkbox" checked={!!picked[f.id]} onChange={(e) => setPicked({ ...picked, [f.id]: e.target.checked })} />
                <FileText className="w-4 h-4 text-[color:var(--crm-text-tertiary)]" />
                <span className="flex-1 font-medium text-[color:var(--crm-text-primary)]">{f.fileName}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">{f.fileType}</span>
                <span className="text-[color:var(--crm-text-secondary)]">{f.source}{f.revision ? ` · ${f.revision}` : ''}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>Upload from computer (DXF / PDF / STEP)</label>
          <label className={`${btnGhost} cursor-pointer`}>
            <Upload className="w-3.5 h-3.5" /> Choose files
            <input type="file" multiple accept=".dxf,.dwg,.pdf,.step,.stp,.iges,.igs" className="hidden" onChange={onUpload} />
          </label>
          {uploads.map((u, i) => (
            <div key={i} className="mt-1.5 text-xs flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> {u.fileName}
              <button className="text-red-600 ml-auto" onClick={() => setUploads(uploads.filter((_, x) => x !== i))}>remove</button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Priority</label>
            <select className={inputCls} value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Assign to (Nesting engineer, optional)</label>
            <input className={inputCls} value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Note for Nesting</label>
          <textarea className={inputCls} rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Revision, thickness, special instructions..." />
        </div>
      </div>
    </ERPModal>
  );
}
