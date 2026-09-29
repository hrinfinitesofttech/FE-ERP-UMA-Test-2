'use client';

import React, { useState, useMemo } from 'react';
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
    reportingManager: 'Rajesh Patel',
    shift: 'General Shift (09:00 AM - 06:00 PM)',
    offeredCTC: 480000,
  });

  // Close modal on ESC key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const closeModal = () => {
    setShowAddModal(false);
    setSelectedEmployeeId('');
    setFormData({
      candidateId: '',
      candidateName: '',
      email: '',
      mobile: '',
      joiningDate: new Date().toISOString().split('T')[0],
      department: departments?.[0]?.departmentName || 'Production',
      designation: designations?.[0]?.designationName || 'Senior CNC Operator',
      reportingManager: 'Rajesh Patel',
      shift: 'General Shift (09:00 AM - 06:00 PM)',
      offeredCTC: 480000,
    });
  };

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = masterEmployees.find((e) => e.id === empId);
    if (emp) {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.username || emp.id;
      setFormData({
        ...formData,
        candidateId: emp.id,
        candidateName: fullName,
        email: emp.email || '',
        mobile: emp.mobile || emp.phone || '',
        department: emp.departmentName || emp.department || departments?.[0]?.departmentName || 'Production',
        designation: emp.designation || designations?.[0]?.designationName || 'Staff',
        reportingManager: emp.reportingManagerName || 'Rajesh Patel',
        joiningDate: emp.joiningDate || emp.joinedDate || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        ...formData,
        candidateId: '',
        candidateName: '',
        email: '',
        mobile: '',
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
        // An employee who does not exist in the Employee Master must not appear in the onboarding list.
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
          };
        }
        return item;
      });
  }, [employeeOnboardings, masterEmployees, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = (employeeOnboardings || []).length;
    const inProgress = (employeeOnboardings || []).filter((o) => o.status === 'In Progress').length;
    const completed = (employeeOnboardings || []).filter((o) => o.status === 'Completed').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, inProgress, completed, rate };
  }, [employeeOnboardings]);

  const handleCreateOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.candidateName.trim() || !formData.candidateId) {
      alert('Please select an existing employee from Employee Master.');
      return;
    }

    addEmployeeOnboarding({
      candidateId: formData.candidateId,
      candidateName: formData.candidateName.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      joiningDate: formData.joiningDate,
      department: formData.department,
      designation: formData.designation,
      reportingManager: formData.reportingManager,
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

    closeModal();
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-crm-brand-700 hover:bg-crm-brand-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" /> + Initiate New Onboarding
          </button>
        </div>
      </div>

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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 border border-[#EBE3DB] rounded-xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search candidate, department, designation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF7F5] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-[#70665F] font-medium">Status:</span>
          {['All', 'In Progress', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                statusFilter === st
                  ? 'bg-crm-brand-700 text-white shadow-sm'
                  : 'bg-[#FAF7F5] text-[#544B45] hover:bg-[#EBE3DB]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Onboarding Records Grid */}
      <div className="grid grid-cols-1 gap-5">
        {filteredOnboardings.length === 0 ? (
          <div className="bg-white border border-[#EBE3DB] rounded-xl p-12 text-center space-y-3">
            <UserPlus className="w-12 h-12 text-[#A89F91] mx-auto" />
            <h4 className="text-base font-bold text-[#211B17]">No Onboarding Records Found</h4>
            <p className="text-xs text-[#70665F] max-w-md mx-auto">
              Click &quot;+ Initiate New Onboarding&quot; to start onboarding candidates through the standard 10-step lifecycle.
            </p>
          </div>
        ) : (
          filteredOnboardings.map((item) => {
            const completedTasks = item.onboardingChecklist?.filter((c) => c.completed).length || 0;
            const totalTasks = item.onboardingChecklist?.length || 0;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#EBE3DB] rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-crm-brand-700 bg-crm-brand-50 px-2 py-0.5 rounded border border-crm-brand-200">
                        {item.id}
                      </span>
                      {item.candidateId && (
                        <span className="text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          ID: {item.candidateId}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-[#211B17]">{item.candidateName}</h3>
                      <span
                        className={`px-3 py-0.5 rounded-full text-xs font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs text-[#70665F] mt-2 flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-[#70665F]" />
                        Dept: <strong className="text-[#211B17] ml-0.5">{item.department}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#70665F]" />
                        Designation: <strong className="text-[#211B17] ml-0.5">{item.designation}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#70665F]" />
                        Joining: <strong className="text-[#211B17] ml-0.5">{item.joiningDate}</strong>
                      </span>
                      {item.offeredCTC ? (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-[#70665F]" />
                          Offered CTC: <strong className="text-emerald-700 ml-0.5">₹{item.offeredCTC.toLocaleString()}</strong>
                        </span>
                      ) : null}
                      {item.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-[#70665F]" />
                          {item.email}
                        </span>
                      )}
                      {item.mobile && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#70665F]" />
                          {item.mobile}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'Completed' ? (
                      <button
                        onClick={() => updateEmployeeOnboardingStatus(item.id, 'Completed')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                      >
                        <UserCheck className="w-4 h-4" />
                        Complete & Activate
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" /> Active Employee
                      </span>
                    )}

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[11px] rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Onboarding"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#544B45]">
                      Checklist Progress ({completedTasks}/{totalTasks} items completed)
                    </span>
                    <span className="font-bold text-crm-brand-700">{progress}%</span>
                  </div>
                  <div className="w-full bg-[#EBE3DB] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        progress === 100 ? 'bg-emerald-600' : 'bg-crm-brand-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Interactive Checklist */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-[#70665F] uppercase tracking-wider">
                    Mandatory Joining Checklist (Click to Toggle)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {item.onboardingChecklist.map((chk, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleOnboardingChecklistTask(item.id, i)}
                        className={`flex items-center justify-between p-3 rounded-lg border text-xs text-left transition ${
                          chk.completed
                            ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/70'
                            : 'bg-[#FAF7F5] border-[#EBE3DB] hover:bg-[#F2ECE6]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {chk.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                          <span
                            className={
                              chk.completed ? 'text-[#211B17] font-semibold' : 'text-[#70665F] font-medium'
                            }
                          >
                            {chk.task}
                          </span>
                        </div>
                        <span className="text-[10px] text-crm-brand-800 bg-crm-brand-100 px-2 py-0.5 rounded font-semibold ml-2">
                          {chk.assignedTo}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-[#EBE3DB] pb-3">
              <h2 className="text-lg font-bold text-[#211B17] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-crm-brand-700" /> Initiate Employee Onboarding
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-[#70665F] hover:text-[#211B17] p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOnboarding} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#544B45] font-semibold mb-1">
                  Select Existing Employee from Master *
                </label>
                <select
                  required
                  value={selectedEmployeeId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] font-medium focus:outline-none focus:border-crm-brand-500"
                >
                  <option value="">-- Choose Employee from Employee Master --</option>
                  {masterEmployees.map((emp) => {
                    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.name || emp.username;
                    return (
                      <option key={emp.id} value={emp.id}>
                        {fullName} ({emp.id}) - {emp.departmentName || emp.department || 'Staff'} ({emp.designation || 'Employee'})
                      </option>
                    );
                  })}
                </select>
                {!selectedEmployeeId ? (
                  <p className="text-[11px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                    <span>⚠️</span> Only employees registered in Employee Master can be onboarded.
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1">
                    <span>✓</span> Candidate details linked to Employee Master ({selectedEmployeeId}).
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="Auto-populated from Master"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Auto-populated from Master"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
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
                    onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Offered CTC (₹ / Annum)</label>
                  <input
                    type="number"
                    value={formData.offeredCTC}
                    onChange={(e) => setFormData({ ...formData, offeredCTC: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
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
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Reporting Manager</label>
                  <input
                    type="text"
                    placeholder="e.g. Rajesh Patel"
                    value={formData.reportingManager}
                    onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-[#544B45] font-semibold mb-1">Assigned Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#EBE3DB] rounded-lg text-[#211B17] focus:outline-none focus:border-crm-brand-500 font-medium"
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
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#FAF7F5] hover:bg-[#EBE3DB] text-[#544B45] font-semibold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEmployeeId}
                  className={`px-5 py-2 font-semibold rounded-lg shadow-sm transition ${
                    selectedEmployeeId
                      ? 'bg-crm-brand-700 hover:bg-crm-brand-800 text-white cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
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
