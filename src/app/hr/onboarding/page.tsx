'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useERP } from '../../../context/ERPContext';
import {
  UserPlus,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileCheck2,
  Building,
  Briefcase,
  DollarSign,
  Plus,
  ShieldCheck,
  X,
  Trash2,
  Search,
  Users,
  CheckSquare,
  Square,
  Calendar,
  Mail,
  Phone,
  UserCheck,
  Layers,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function EmployeeOnboardingPage() {
  const {
    employeeOnboardings,
    addEmployeeOnboarding,
    updateEmployeeOnboardingStatus,
    deleteEmployeeOnboarding,
    toggleOnboardingChecklistTask,
    departments,
    designations,
    shiftMasters,
    availableEmployees,
    employees,
  } = useERP();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [managerSearchQuery, setManagerSearchQuery] = useState('');
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const masterEmployees = useMemo(() => {
    const list = (availableEmployees && availableEmployees.length > 0 ? availableEmployees : employees) || [];
    return list.filter((e) => e && (e.id || e.firstName || e.name) && (e as any).status !== 'Inactive' && (e as any).status !== 'Terminated');
  }, [availableEmployees, employees]);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [formData, setFormData] = useState({
    candidateId: '',
    candidateName: '',
    email: '',
    mobile: '',
    joiningDate: new Date().toISOString().split('T')[0],
    department: 'Production',
    designation: 'Senior CNC Operator',
    reportingManager: '',
    shift: 'General Shift (GS)',
    offeredCTC: 480000,
  });

  // Eligible managers must exclude the employee being onboarded
  const eligibleManagers = useMemo(() => {
    return masterEmployees.filter((m) => m.id !== selectedEmployeeId);
  }, [masterEmployees, selectedEmployeeId]);

  // Check if Add form has unsaved user inputs
  const isFormDirty = useMemo(() => {
    return selectedEmployeeId !== '' || formData.reportingManager !== '' || formData.offeredCTC !== 480000;
  }, [selectedEmployeeId, formData.reportingManager, formData.offeredCTC]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        closeModalWithConfirm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, isFormDirty]);

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedEmployeeId('');
    setFormErrors({});
    setManagerSearchQuery('');
    setIsManagerDropdownOpen(false);
    setFormData({
      candidateId: '',
      candidateName: '',
      email: '',
      mobile: '',
      joiningDate: new Date().toISOString().split('T')[0],
      department: departments?.[0]?.departmentName || 'Production',
      designation: designations?.[0]?.designationName || 'Senior CNC Operator',
      reportingManager: '',
      shift: 'General Shift (GS)',
      offeredCTC: 480000,
    });
  };

  const closeModalWithConfirm = () => {
    if (isFormDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    setFormErrors({});
    const emp = masterEmployees.find((e) => e.id === empId);
    if (emp) {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.username || emp.id;
      const defaultMgr = emp.reportingManagerName || (masterEmployees.find(m => m.id !== emp.id && (m.designation || '').toLowerCase().includes('manager'))?.name || '');
      setFormData({
        ...formData,
        candidateId: emp.id,
        candidateName: fullName,
        email: emp.email || '',
        mobile: emp.mobile || emp.phone || '',
        department: emp.departmentName || emp.department || departments?.[0]?.departmentName || 'Production',
        designation: emp.designation || designations?.[0]?.designationName || 'Staff',
        reportingManager: defaultMgr,
        joiningDate: emp.joiningDate || emp.joinedDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        ...formData,
        candidateId: '',
        candidateName: '',
        email: '',
        mobile: '',
        reportingManager: '',
      });
    }
  };

  const onboardingSteps = [
    'Recruitment',
    'Offer Letter',
    'Joining',
    'Doc Verification',
    'Employee Creation',
    'Dept Assignment',
    'Role Assignment',
    'Shift Assignment',
    'Salary Structure',
    'Active Employee',
  ];

  const filteredOnboardings = useMemo(() => {
    return (employeeOnboardings || [])
      .filter((item) => {
        const matchingMaster = masterEmployees.find(
          (m) =>
            (item.candidateId && m.id === item.candidateId) ||
            (m.firstName && `${m.firstName} ${m.lastName || ''}`.trim().toLowerCase() === item.candidateName?.toLowerCase()) ||
            (m.name && m.name.toLowerCase() === item.candidateName?.toLowerCase()) ||
            (m.email && item.email && m.email.toLowerCase() === item.email.toLowerCase())
        );
        if (!matchingMaster && masterEmployees.length > 0) {
          return false;
        }

        const matchesSearch =
          item.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.candidateId && item.candidateId.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map((item) => {
        const matchingMaster = masterEmployees.find(
          (m) =>
            (item.candidateId && m.id === item.candidateId) ||
            (m.firstName && `${m.firstName} ${m.lastName || ''}`.trim().toLowerCase() === item.candidateName?.toLowerCase()) ||
            (m.name && m.name.toLowerCase() === item.candidateName?.toLowerCase()) ||
            (m.email && item.email && m.email.toLowerCase() === item.email.toLowerCase())
        );
        if (matchingMaster) {
          const fullName = `${matchingMaster.firstName || ''} ${matchingMaster.lastName || ''}`.trim() || matchingMaster.name || item.candidateName;
          return {
            ...item,
            candidateId: matchingMaster.id || item.candidateId,
            candidateName: fullName,
            email: matchingMaster.email || item.email,
            mobile: matchingMaster.mobile || matchingMaster.phone || item.mobile,
            department: matchingMaster.departmentName || matchingMaster.department || item.department,
            designation: matchingMaster.designation || item.designation,
            joiningDate: matchingMaster.joiningDate || matchingMaster.joinedDate || item.joiningDate,
          };
        }
        return item;
      });
  }, [employeeOnboardings, masterEmployees, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredOnboardings.length;
    const inProgress = filteredOnboardings.filter((o) => o.status === 'In Progress').length;
    const completed = filteredOnboardings.filter((o) => o.status === 'Completed').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, inProgress, completed, rate };
  }, [filteredOnboardings]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!selectedEmployeeId || !formData.candidateId) {
      errors.employee = 'Please select an employee from Employee Master.';
    }

    if (!formData.reportingManager.trim()) {
      errors.reportingManager = 'Please select a reporting manager.';
    }

    if (!formData.joiningDate) {
      errors.joiningDate = 'Please select the joining date.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      addEmployeeOnboarding({
        candidateId: formData.candidateId,
        candidateName: formData.candidateName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        joiningDate: formData.joiningDate,
        department: formData.department,
        designation: formData.designation,
        reportingManager: formData.reportingManager.trim(),
        shift: formData.shift,
        salaryStructureId: 'SAL-STR-01',
        offeredCTC: Number(formData.offeredCTC) || 0,
        onboardingChecklist: [
          { task: 'Appointment Letter Signed', completed: true, assignedTo: 'HR Manager' },
          { task: 'Aadhaar & PAN Verification', completed: true, assignedTo: 'HR Admin' },
          { task: 'Bank Account Passbook Uploaded', completed: false, assignedTo: 'Employee' },
          { task: 'PPE & Shop Floor Safety Induction', completed: false, assignedTo: 'Safety Officer' },
          { task: 'ERP Account & Role Assigned', completed: true, assignedTo: 'IT Admin' },
        ],
        status: 'In Progress',
      });

      setFeedbackMessage({
        type: 'success',
        text: `Onboarding workflow initiated successfully for ${formData.candidateName}.`,
      });
      closeModal();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: 'Something went wrong while creating onboarding workflow. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteEmployeeOnboarding(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-6 space-y-6 bg-[#FDFBF9] min-h-screen text-[#211B17]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-crm-brand-700" />
            Employee Onboarding Workflow
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Complete 10-Step Joining Execution: Offer → Verification → Creation → Role → Shift → Payroll Structure
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFormErrors({});
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> + Initiate New Onboarding
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-rose-50 text-rose-800 border border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">Total Onboardings</span>
            <Users className="w-5 h-5 text-crm-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-[#211B17] mt-2">{stats.total}</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">In Progress</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{stats.inProgress}</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">Completed & Active</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">{stats.completed}</div>
        </div>

        <div className="bg-white border border-[#EBE3DB] p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#70665F]">Completion Rate</span>
            <ShieldCheck className="w-5 h-5 text-crm-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-crm-brand-700 mt-2">{stats.rate}%</div>
        </div>
      </div>

      {/* 10-Step Onboarding Pipeline Visualization */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">Standard Onboarding Lifecycle Stages</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2 text-center">
          {onboardingSteps.map((step, idx) => (
            <div key={idx} className="p-2.5 bg-[#FAF7F5] border border-[#EBE3DB] rounded-lg space-y-1.5 hover:border-crm-brand-300 transition">
              <span className="w-5 h-5 rounded-full bg-crm-brand-100 text-crm-brand-800 font-bold text-[10px] inline-flex items-center justify-center">
                {idx + 1}
              </span>
              <div className="text-[11px] font-semibold text-[#3E2723] leading-tight">{step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-[#EBE3DB] rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search candidate, department, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F5] border border-[#EBE3DB] rounded-xl text-xs text-[#211B17] focus:outline-none focus:border-crm-brand-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#70665F]">Status:</span>
          {['All', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-crm-brand-700 text-white'
                  : 'bg-[#FAF7F5] text-[#544B45] hover:bg-[#EBE3DB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Onboarding List */}
      <div className="space-y-4">
        {filteredOnboardings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-[#EBE3DB] shadow-sm">
            <UserPlus className="w-12 h-12 text-[#70665F] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-bold text-[#211B17]">No onboarding records found</h3>
            <p className="text-xs text-[#70665F] mt-1">
              Click &quot;+ Initiate New Onboarding&quot; to begin a candidate workflow.
            </p>
          </div>
        ) : (
          filteredOnboardings.map((item) => {
            const checklist = item.onboardingChecklist || [];
            const completedCount = checklist.filter((c) => c.completed).length;
            const progressPercent = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;
            const isCompleted = item.status === 'Completed';

            return (
              <div
                key={item.id}
                className="bg-white border border-[#EBE3DB] rounded-xl p-5 space-y-4 shadow-sm hover:border-crm-brand-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE3DB] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold rounded-md">
                      {item.id}
                    </span>
                    <span className="text-xs font-mono text-[#70665F] bg-[#FAF7F5] px-2 py-0.5 rounded border border-[#EBE3DB]">
                      ID: {item.candidateId}
                    </span>
                    <h2 className="text-lg font-bold text-[#211B17]">{item.candidateName}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCompleted && (
                      <button
                        onClick={() => updateEmployeeOnboardingStatus(item.id, 'Completed')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete & Activate
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete Onboarding Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Candidate Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                  <div>
                    <span className="text-[#70665F] block font-semibold">Dept:</span>
                    <span className="text-[#211B17] font-bold">{item.department}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-semibold">Designation:</span>
                    <span className="text-[#211B17] font-bold">{item.designation}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-semibold">Joining:</span>
                    <span className="text-[#211B17] font-mono">{item.joiningDate}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-semibold">Offered CTC:</span>
                    <span className="text-emerald-700 font-bold font-mono">₹{Number(item.offeredCTC || 480000).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="truncate">
                    <span className="text-[#70665F] block font-semibold">Email:</span>
                    <span className="text-[#544B45] truncate block">{item.email}</span>
                  </div>
                  <div>
                    <span className="text-[#70665F] block font-semibold">Mobile:</span>
                    <span className="text-[#544B45] font-mono">{item.mobile}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#70665F]">
                      Checklist Progress ({completedCount}/{checklist.length} items completed)
                    </span>
                    <span className="font-bold text-crm-brand-800">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-[#EBE3DB] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-crm-brand-700 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Tasks Interactive Badges */}
                <div className="space-y-2 pt-1 border-t border-[#EBE3DB]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#70665F]">
                    Mandatory Joining Checklist (Click to toggle)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {checklist.map((task, tIdx) => (
                      <div
                        key={tIdx}
                        onClick={() => toggleOnboardingChecklistTask(item.id, tIdx)}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition ${
                          task.completed
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                            : 'bg-amber-50/70 border-amber-200 text-amber-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          )}
                          <span className="font-semibold">{task.task}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/80 border border-black/10 font-mono">
                          {task.assignedTo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div
          onClick={() => setDeleteConfirmId(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
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
                <h3 className="text-sm font-bold text-[#211B17]">Delete Onboarding Record?</h3>
                <p className="text-xs text-[#70665F] mt-0.5">
                  Are you sure you want to remove this employee onboarding workflow?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-[#EBE3DB]">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] text-[#544B45] hover:bg-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Initiate New Onboarding Modal */}
      {showAddModal && (
        <div
          onClick={closeModalWithConfirm}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-crm-brand-700" /> Initiate Employee Onboarding
              </h2>
              <button
                type="button"
                onClick={closeModalWithConfirm}
                className="text-[#70665F] hover:text-[#211B17] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOnboarding} noValidate className="space-y-4 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">Select Existing Employee from Master *</label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className={`w-full px-3 py-2 bg-white border rounded-xl text-[#211B17] font-medium focus:outline-none ${
                    formErrors.employee ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-crm-brand-500'
                  }`}
                >
                  <option value="">-- Choose Employee from Employee Master --</option>
                  {masterEmployees.map((emp) => {
                    const name = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.id;
                    const dept = emp.departmentName || emp.department || 'General';
                    const desig = emp.designation || 'Staff';
                    return (
                      <option key={emp.id} value={emp.id}>
                        {name} ({desig} • {dept} • {emp.id})
                      </option>
                    );
                  })}
                </select>
                {formErrors.employee && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {formErrors.employee}
                  </p>
                )}
                <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Only employees registered in Employee Master can be onboarded.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    readOnly
                    placeholder="Auto-populated from Master"
                    value={formData.email}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#EBE3DB] rounded-xl text-[#544B45]"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Auto-populated from Master"
                    value={formData.mobile}
                    className="w-full px-3 py-2 bg-[#FAF7F5] border border-[#EBE3DB] rounded-xl text-[#544B45]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={(e) => {
                      setFormData({ ...formData, joiningDate: e.target.value });
                      if (formErrors.joiningDate) setFormErrors((prev) => ({ ...prev, joiningDate: '' }));
                    }}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-[#211B17] focus:outline-none ${
                      formErrors.joiningDate ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-crm-brand-500'
                    }`}
                  />
                  {formErrors.joiningDate && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.joiningDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Offered CTC (₹ / Annum)</label>
                  <input
                    type="number"
                    value={formData.offeredCTC}
                    onChange={(e) => setFormData({ ...formData, offeredCTC: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  >
                    {(departments || []).map((d) => {
                      const name = d.departmentName || (d as any).name || 'Department';
                      return (
                        <option key={d.id || name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Designation</label>
                  <select
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  >
                    {(designations || []).map((desg) => {
                      const name = desg.designationName || (desg as any).name || 'Role';
                      return (
                        <option key={desg.id || name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Mandatory Searchable Reporting Manager Dropdown (Excludes Self) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">
                    Reporting Manager *
                  </label>
                  <select
                    required
                    value={formData.reportingManager}
                    onChange={(e) => {
                      setFormData({ ...formData, reportingManager: e.target.value });
                      if (formErrors.reportingManager) setFormErrors((prev) => ({ ...prev, reportingManager: '' }));
                    }}
                    className={`w-full px-3 py-2 bg-white border rounded-xl text-[#211B17] focus:outline-none ${
                      formErrors.reportingManager ? 'border-rose-500 bg-rose-50/20' : 'border-[#EBE3DB] focus:border-crm-brand-500'
                    }`}
                  >
                    <option value="">-- Select Active Manager --</option>
                    {eligibleManagers.map((m) => {
                      const mName = `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.name || m.id;
                      const mDesg = m.designation || m.role || 'Staff';
                      const mDept = m.departmentName || m.department || 'General';
                      return (
                        <option key={m.id} value={mName}>
                          {mName} ({mDesg} • {mDept})
                        </option>
                      );
                    })}
                  </select>
                  {formErrors.reportingManager && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {formErrors.reportingManager}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Assigned Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-xl text-[#211B17] focus:outline-none focus:border-crm-brand-500 font-medium"
                  >
                    {((shiftMasters && shiftMasters.length > 0)
                      ? shiftMasters
                      : [
                          { id: 'SHF-001', shiftName: 'General Shift (GS)', startTime: '09:00', endTime: '18:00' },
                          { id: 'SHF-002', shiftName: 'Morning Shift (Shift A)', startTime: '06:00', endTime: '14:00' },
                          { id: 'SHF-003', shiftName: 'Evening Shift (Shift B)', startTime: '14:00', endTime: '22:00' },
                          { id: 'SHF-004', shiftName: 'Night Shift (Shift C)', startTime: '22:00', endTime: '06:00' },
                        ]
                    ).map((s) => {
                      const shiftName = s.shiftName || 'General Shift (GS)';
                      return (
                        <option key={s.id || shiftName} value={shiftName}>
                          {shiftName} ({s.startTime} - {s.endTime})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EBE3DB] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModalWithConfirm}
                  className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmployeeId || isLoading}
                  className={`px-5 py-2 font-bold rounded-xl shadow-md transition flex items-center gap-2 ${
                    selectedEmployeeId
                      ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Start Onboarding Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
