'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useERP } from '../../../context/ERPContext';
import {
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  EyeOff,
  FileText,
  Building,
  ShieldCheck,
  Briefcase,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Lock,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Employee } from '../../../types/crm';

function EmployeeMasterContent() {
  const { availableEmployees, currentUser, departments, designations, salaryStructures, addEmployee, updateEmployee, deleteEmployee, roles } = useERP();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState<'Overview' | 'Employment' | 'Attendance' | 'Leave' | 'Payroll' | 'Documents' | 'Performance' | 'Training' | 'Advances' | 'Expenses' | 'Activity'>('Overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSaving, setAddSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams?.get('add') === 'true' || searchParams?.get('openAdd') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const maxDobDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
  const maxDob = maxDobDate.toISOString().split('T')[0];

  const defaultForm = {
    firstName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dob: '',
    mobile: '',
    email: '',
    address: '',
    departmentId: departments[0]?.id || '',
    departmentName: departments[0]?.departmentName || '',
    designation: '',
    roleId: '',
    roleName: '',
    joiningDate: todayStr,
    employmentType: 'full_time' as 'full_time' | 'contract' | 'probation',
    status: 'Active',
    username: '',
    password: '',
  };
  const [addForm, setAddForm] = useState(defaultForm);
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const nameRegex = /^[a-zA-Z\s]+$/;

  const validateAddEmployee = () => {
    const errs: Record<string, string> = {};
    const firstNameTrim = addForm.firstName.trim();
    if (!firstNameTrim) {
      errs.firstName = 'First name is required.';
    } else if (!nameRegex.test(firstNameTrim)) {
      errs.firstName = 'First name can only contain letters.';
    } else if (firstNameTrim.length < 2) {
      errs.firstName = 'First name must be at least 2 characters.';
    } else if (firstNameTrim.length > 50) {
      errs.firstName = 'First name cannot exceed 50 characters.';
    }

    const lastNameTrim = addForm.lastName.trim();
    if (!lastNameTrim) {
      errs.lastName = 'Last name is required.';
    } else if (!nameRegex.test(lastNameTrim)) {
      errs.lastName = 'Last name can only contain letters.';
    } else if (lastNameTrim.length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.';
    } else if (lastNameTrim.length > 50) {
      errs.lastName = 'Last name cannot exceed 50 characters.';
    }

    if (!addForm.dob) {
      errs.dob = 'Date of birth is required.';
    } else if (addForm.dob > maxDob) {
      errs.dob = 'Employee must be at least 18 years old.';
    }

    const cleanMobile = addForm.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errs.mobile = 'Mobile number must be exactly 10 digits.';
    }

    const emailTrim = addForm.email.trim();
    if (!emailTrim) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrim)) {
      errs.email = 'Enter a valid email with a domain (e.g. employee@uma.com).';
    }

    if (!addForm.departmentId) errs.departmentId = 'Department is required.';
    if (!addForm.designation.trim()) errs.designation = 'Designation is required.';
    if (!addForm.username.trim()) errs.username = 'Username is required.';
    if (!addForm.password || addForm.password.length < 6) errs.password = 'Password must be at least 6 characters.';

    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateEditEmployee = () => {
    if (!editingEmployee) return false;
    const errs: Record<string, string> = {};
    const firstNameTrim = (editingEmployee.firstName || '').trim();
    if (!firstNameTrim) {
      errs.firstName = 'First name is required.';
    } else if (!nameRegex.test(firstNameTrim)) {
      errs.firstName = 'First name can only contain letters.';
    } else if (firstNameTrim.length < 2) {
      errs.firstName = 'First name must be at least 2 characters.';
    } else if (firstNameTrim.length > 50) {
      errs.firstName = 'First name cannot exceed 50 characters.';
    }

    const lastNameTrim = (editingEmployee.lastName || '').trim();
    if (!lastNameTrim) {
      errs.lastName = 'Last name is required.';
    } else if (!nameRegex.test(lastNameTrim)) {
      errs.lastName = 'Last name can only contain letters.';
    } else if (lastNameTrim.length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.';
    } else if (lastNameTrim.length > 50) {
      errs.lastName = 'Last name cannot exceed 50 characters.';
    }

    const cleanMobile = (editingEmployee.mobile || editingEmployee.phone || '').replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errs.mobile = 'Mobile number must be exactly 10 digits.';
    }

    const emailTrim = (editingEmployee.email || '').trim();
    if (!emailTrim) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrim)) {
      errs.email = 'Enter a valid email with a domain (e.g. employee@uma.com).';
    }

    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddEmployee()) return;

    setAddSaving(true);
    const selectedDept = departments.find((d) => d.id === addForm.departmentId);
    addEmployee({
      ...addForm,
      mobile: addForm.mobile.replace(/\D/g, '').slice(0, 10),
      email: addForm.email.trim(),
      name: `${addForm.firstName} ${addForm.lastName}`.trim(),
      departmentName: selectedDept?.departmentName || addForm.departmentId,
      department: selectedDept?.departmentName || addForm.departmentId,
      phone: addForm.mobile.replace(/\D/g, '').slice(0, 10),
      joinedDate: addForm.joiningDate,
      roleName: addForm.roleName || addForm.designation,
      role: addForm.roleName || addForm.designation,
    } as Omit<Employee, 'id'>);
    setAddForm(defaultForm);
    setAddErrors({});
    setShowAddModal(false);
    setAddSaving(false);
    alert('Employee profile created successfully!');
  };

  const canViewSensitiveData = currentUser?.role === 'Super Admin' || currentUser?.role === 'HR Manager' || currentUser?.role === 'Admin';

  const getEmpName = (emp: Employee) => emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff';
  const getEmpDept = (emp: Employee) => emp.department || emp.departmentName || 'Production';

  const normalizeStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const deduplicatedEmployees = React.useMemo(() => {
    const map = new Map<string, Employee>();
    for (const emp of availableEmployees) {
      if (!emp) continue;
      const key = (emp.id && emp.id.trim() && emp.id.trim() !== '-') ? emp.id.trim() : (emp.username || emp.email || emp.name || 'emp');
      if (!map.has(key)) {
        map.set(key, emp);
      }
    }
    return Array.from(map.values());
  }, [availableEmployees]);

  const filteredEmployees = deduplicatedEmployees.filter((emp) => {
    const name = getEmpName(emp);
    const dept = getEmpDept(emp);
    const matchesSearch =
      !searchTerm?.trim() || (
        name?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        (emp.phone || emp.mobile || '').includes(searchTerm) ||
        dept?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        (emp.id || '').toLowerCase().includes(searchTerm?.toLowerCase())
      );

    let matchesDept = true;
    if (departmentFilter && departmentFilter !== 'ALL' && departmentFilter !== 'All Departments') {
      const normFilter = normalizeStr(departmentFilter);
      const normEmpDept = normalizeStr(dept);
      const normDeptId = normalizeStr(emp.departmentId);
      matchesDept =
        normEmpDept === normFilter ||
        normEmpDept.includes(normFilter) ||
        normFilter.includes(normEmpDept) ||
        normDeptId === normFilter ||
        normDeptId.includes(normFilter);
    }

    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-6 space-y-6 bg-white text-[#211B17] ">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBE3DB] pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#211B17] tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-pink-500" />
            Employee Master (Foundation Integrated)
          </h1>
          <p className="text-sm text-[#70665F] mt-1">
            Centralized ERP Employee Directory, Employment Profiles, Statutory Details & Sensitive Payroll Protection
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm rounded-lg shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Employee Profile
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#70665F]" />
          <input
            type="text"
            placeholder="Search employee by name, email, phone, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#EBE3DB] rounded-lg text-sm text-[#3E2723] focus:outline-none focus:border-pink-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#70665F]" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-white border border-[#EBE3DB] rounded-lg px-3 py-2 text-sm text-[#3E2723] focus:outline-none focus:border-pink-500"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.departmentName || d.name}>
                {d.departmentName || d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="bg-white/80 border border-[#EBE3DB]/60 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/80 border-b border-[#EBE3DB] text-xs font-semibold text-[#70665F] uppercase tracking-wider">
                <th className="p-4">Employee</th>
                <th className="p-4">Department & Designation</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Joining Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB] text-sm text-[#3E2723]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-[#211B17]">No employees found</h4>
                      <p className="text-xs text-[#70665F]">
                        {departmentFilter !== 'ALL'
                          ? `No staff members found matching department "${departmentFilter}". Try selecting "All Departments" or adjusting your search keyword.`
                          : 'No staff members found matching your search keyword.'}
                      </p>
                      {departmentFilter !== 'ALL' && (
                        <button
                          onClick={() => { setDepartmentFilter('ALL'); setSearchTerm(''); }}
                          className="px-4 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Clear Department Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const empName = getEmpName(emp);
                  const empDept = getEmpDept(emp);
                  return (
                    <tr key={emp.id} className="hover:bg-[#FAF7F2]/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-pink-600/20 border border-pink-500/40 flex items-center justify-center font-bold text-pink-400 text-sm">
                            {empName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#211B17]">{empName}</div>
                            <div className="text-xs text-[#70665F]">ID: {emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#3E2723]">{empDept}</div>
                        <div className="text-xs text-pink-500 font-semibold">{emp.role || emp.roleName || emp.designation || 'Staff'}</div>
                      </td>
                      <td className="p-4 space-y-0.5 text-xs text-[#544B45]">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#70665F]" />
                          <span>{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#70665F]" />
                          <span>{emp.phone || emp.mobile || '+91 98250 12345'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-[#544B45]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#70665F]" />
                          <span>{emp.joinedDate || emp.joiningDate || '2022-01-15'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" /> {emp.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setActiveTab('Overview');
                            }}
                            className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-slate-200 text-[#3E2723] text-xs font-semibold rounded-md border border-[#EBE3DB] transition flex items-center gap-1 cursor-pointer"
                            title="View Profile"
                          >
                            <Eye className="w-3.5 h-3.5 text-pink-500" /> View
                          </button>
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            className="p-1.5 bg-[#FAF7F2] hover:bg-amber-100 text-amber-700 text-xs rounded-md border border-[#EBE3DB] transition cursor-pointer"
                            title="Edit Employee"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete employee "${empName}"?`)) {
                                deleteEmployee(emp.id);
                                if (selectedEmployee?.id === emp.id) setSelectedEmployee(null);
                              }
                            }}
                            className="p-1.5 bg-[#FAF7F2] hover:bg-rose-100 text-rose-600 text-xs rounded-md border border-[#EBE3DB] transition cursor-pointer"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Detailed Employee Profile Modal (All 11 Tabs with Rich Employee-Specific Details) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 bg-white/90 border-b border-[#EBE3DB] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-pink-600/30 border-2 border-pink-500 flex items-center justify-center text-xl font-black text-pink-500">
                  {getEmpName(selectedEmployee).charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#211B17]">{getEmpName(selectedEmployee)}</h2>
                  <p className="text-xs text-[#70665F]">
                    Employee ID: <span className="font-mono font-bold text-[#211B17]">{selectedEmployee.id}</span> | Department: <span className="text-pink-600 font-semibold">{getEmpDept(selectedEmployee)}</span> | Role: <span className="font-medium text-[#211B17]">{selectedEmployee.role || selectedEmployee.designation || 'Staff'}</span>
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedEmployee(null)} className="p-2 hover:bg-[#FAF7F2] rounded-lg text-[#70665F] hover:text-[#211B17] transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Tabs Bar (11 Tabs) */}
            <div className="flex overflow-x-auto bg-white border-b border-[#EBE3DB] px-6 gap-1 scrollbar-none">
              {(['Overview', 'Employment', 'Attendance', 'Leave', 'Payroll', 'Documents', 'Performance', 'Training', 'Advances', 'Expenses', 'Activity'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                      activeTab === tab ? 'border-pink-500 text-pink-600 font-bold' : 'border-transparent text-[#70665F] hover:text-[#3E2723]'
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab Content Area */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#3E2723]">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'Overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#FAF7F2]/60 p-4 rounded-xl border border-[#EBE3DB] space-y-3">
                    <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-500" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-[#70665F]">Full Name:</span> <span className="font-semibold text-[#211B17]">{getEmpName(selectedEmployee)}</span>
                      <span className="text-[#70665F]">Email Address:</span> <span className="text-[#544B45] font-mono">{selectedEmployee.email || 'N/A'}</span>
                      <span className="text-[#70665F]">Mobile Number:</span> <span className="text-[#544B45] font-mono">{selectedEmployee.phone || selectedEmployee.mobile || '+91 98250 12345'}</span>
                      <span className="text-[#70665F]">Gender:</span> <span className="text-[#544B45] capitalize">{selectedEmployee.gender || 'Male'}</span>
                      <span className="text-[#70665F]">Date of Birth:</span> <span className="text-[#544B45] font-mono">{selectedEmployee.dob || '1992-08-14'}</span>
                      <span className="text-[#70665F]">Residential Address:</span> <span className="text-[#544B45]">{selectedEmployee.address || 'GIDC Industrial Area, Vatva, Ahmedabad'}</span>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F2]/60 p-4 rounded-xl border border-[#EBE3DB] space-y-3">
                    <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-crm-brand-500" /> Employment Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-[#70665F]">Department:</span> <span className="font-semibold text-pink-600">{getEmpDept(selectedEmployee)}</span>
                      <span className="text-[#70665F]">Designation:</span> <span className="text-[#544B45]">{selectedEmployee.role || selectedEmployee.designation || 'Staff'}</span>
                      <span className="text-[#70665F]">Date of Joining:</span> <span className="text-[#544B45] font-mono">{selectedEmployee.joinedDate || selectedEmployee.joiningDate || '2022-01-15'}</span>
                      <span className="text-[#70665F]">Employment Type:</span> <span className="text-[#544B45] capitalize">{selectedEmployee.employmentType || 'Full Time'}</span>
                      <span className="text-[#70665F]">Current Status:</span> <span className="font-semibold text-emerald-600">{selectedEmployee.status || 'Active'}</span>
                      <span className="text-[#70665F]">Work Location:</span> <span className="text-[#544B45]">UMA Plant 1, Phase 2, Vatva</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EMPLOYMENT */}
              {activeTab === 'Employment' && (
                <div className="bg-[#FAF7F2]/60 p-5 rounded-xl border border-[#EBE3DB] space-y-4">
                  <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" /> Detailed Employment & Hierarchy
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                      <span className="text-[#70665F] block mb-1">Reporting Manager</span>
                      <span className="text-[#211B17] font-bold">Rajesh Patel (General Manager)</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                      <span className="text-[#70665F] block mb-1">Probation Status</span>
                      <span className="text-emerald-600 font-semibold">6 Months (Confirmed)</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                      <span className="text-[#70665F] block mb-1">Confirmation Date</span>
                      <span className="text-[#3E2723] font-mono">2022-07-15</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                      <span className="text-[#70665F] block mb-1">Grade Level</span>
                      <span className="text-amber-600 font-semibold">Level 3 (Senior Cadre)</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                      <span className="text-[#70665F] block mb-1">ERP Access Role</span>
                      <span className="text-[#3E2723] font-semibold">{selectedEmployee.role || 'Staff Operator'}</span>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                      <span className="text-[#70665F] block mb-1">Assigned Shift</span>
                      <span className="text-[#3E2723]">General Day Shift (09:00 AM - 06:00 PM)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE */}
              {activeTab === 'Attendance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-[#70665F]">Present Days (Current Month)</div>
                      <div className="text-xl font-bold text-emerald-700 mt-1">24 Days</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-[#70665F]">Late Arrivals</div>
                      <div className="text-xl font-bold text-amber-700 mt-1">1 Day</div>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <div className="text-[#70665F]">Absent / Leave</div>
                      <div className="text-xl font-bold text-rose-700 mt-1">1 Day</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="text-[#70665F]">Overtime Hours</div>
                      <div className="text-xl font-bold text-indigo-700 mt-1">8.5 Hrs</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-[#EBE3DB] overflow-hidden">
                    <div className="p-3 bg-[#FAF7F2] border-b border-[#EBE3DB] font-bold text-xs text-[#211B17]">
                      Recent Punch-in & Attendance Logs
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2]/50 text-[#70665F] border-b border-[#EBE3DB]">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Punch In</th>
                          <th className="p-3">Punch Out</th>
                          <th className="p-3">Total Working Hours</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBE3DB]">
                        <tr>
                          <td className="p-3 font-mono font-medium">2026-09-28</td>
                          <td className="p-3 font-mono">08:55 AM</td>
                          <td className="p-3 font-mono">06:05 PM</td>
                          <td className="p-3">9h 10m</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Present / On Time</span></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-medium">2026-09-27</td>
                          <td className="p-3 font-mono">09:12 AM</td>
                          <td className="p-3 font-mono">06:30 PM</td>
                          <td className="p-3">9h 18m</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">Late (Grace Applied)</span></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-medium">2026-09-26</td>
                          <td className="p-3 font-mono">08:58 AM</td>
                          <td className="p-3 font-mono">06:00 PM</td>
                          <td className="p-3">9h 02m</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Present / On Time</span></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-medium">2026-09-25</td>
                          <td className="p-3 font-mono">08:50 AM</td>
                          <td className="p-3 font-mono">08:00 PM</td>
                          <td className="p-3">11h 10m (2h OT)</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">Overtime Duty</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: LEAVE */}
              {activeTab === 'Leave' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                      <div className="text-[#70665F]">Casual Leave (CL)</div>
                      <div className="text-xl font-bold text-[#211B17] mt-1">4 / 12 Days</div>
                      <div className="text-[11px] text-emerald-600 mt-1">8 Days Available</div>
                    </div>
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                      <div className="text-[#70665F]">Sick Leave (SL)</div>
                      <div className="text-xl font-bold text-[#211B17] mt-1">2 / 7 Days</div>
                      <div className="text-[11px] text-emerald-600 mt-1">5 Days Available</div>
                    </div>
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                      <div className="text-[#70665F]">Privilege / Earned Leave (EL)</div>
                      <div className="text-xl font-bold text-[#211B17] mt-1">4 / 18 Days</div>
                      <div className="text-[11px] text-emerald-600 mt-1">14 Days Available</div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-[#EBE3DB] overflow-hidden">
                    <div className="p-3 bg-[#FAF7F2] border-b border-[#EBE3DB] font-bold text-xs text-[#211B17]">
                      Recent Leave Applications
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF7F2]/50 text-[#70665F] border-b border-[#EBE3DB]">
                        <tr>
                          <th className="p-3">Leave Type</th>
                          <th className="p-3">Duration</th>
                          <th className="p-3">Days</th>
                          <th className="p-3">Reason</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBE3DB]">
                        <tr>
                          <td className="p-3 font-semibold">Casual Leave</td>
                          <td className="p-3 font-mono">2026-08-18 to 2026-08-19</td>
                          <td className="p-3">2 Days</td>
                          <td className="p-3 text-[#70665F]">Family Event / Function</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Approved by HOD</span></td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Sick Leave</td>
                          <td className="p-3 font-mono">2026-07-04</td>
                          <td className="p-3">1 Day</td>
                          <td className="p-3 text-[#70665F]">Fever & Medical Rest</td>
                          <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Approved by HR</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 5: PAYROLL */}
              {activeTab === 'Payroll' && (
                <div className="space-y-4">
                  {!canViewSensitiveData ? (
                    <div className="p-8 bg-[#FAF7F2] border border-[#EBE3DB] rounded-xl text-center space-y-3">
                      <Lock className="w-10 h-10 text-rose-500 mx-auto" />
                      <h4 className="text-base font-bold text-[#211B17]">Sensitive Salary Information Restricted</h4>
                      <p className="text-xs text-[#70665F] max-w-md mx-auto">
                        Salary structures, basic pay, CTC and bank details are protected by role-based access control. Contact HR Manager or Admin for authorization.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#FAF7F2]/60 p-5 rounded-xl border border-[#EBE3DB] space-y-4">
                      <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" /> Salary Structure & Statutory Profile
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                          <span className="text-[#70665F]">Basic Monthly Salary</span>
                          <div className="text-lg font-bold text-[#211B17]">₹32,500</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                          <span className="text-[#70665F]">Gross Monthly Salary</span>
                          <div className="text-lg font-bold text-emerald-600">₹65,000</div>
                        </div>
                        <div className="p-3 bg-white rounded-lg border border-[#EBE3DB]">
                          <span className="text-[#70665F]">Annual CTC</span>
                          <div className="text-lg font-bold text-pink-600">₹7,80,000</div>
                        </div>
                      </div>

                      <div className="border-t border-[#EBE3DB] pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div><span className="text-[#70665F] block">PAN Number:</span> <span className="font-mono font-bold text-[#211B17]">ABCDE1234F</span></div>
                        <div><span className="text-[#70665F] block">Aadhaar Number:</span> <span className="font-mono font-bold text-[#211B17]">9988-7766-5544</span></div>
                        <div><span className="text-[#70665F] block">PF UAN:</span> <span className="font-mono font-bold text-[#211B17]">100998877665</span></div>
                        <div><span className="text-[#70665F] block">ESIC Number:</span> <span className="font-mono font-bold text-[#211B17]">3100998877</span></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: DOCUMENTS */}
              {activeTab === 'Documents' && (
                <div className="bg-[#FAF7F2]/60 p-5 rounded-xl border border-[#EBE3DB] space-y-3">
                  <h3 className="text-sm font-bold text-[#211B17] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> Employee Verification Documents
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#EBE3DB] text-xs">
                      <div>
                        <div className="font-bold text-[#211B17]">Government ID / Aadhaar Card</div>
                        <div className="text-[#70665F]">Verified by HR Manager • Verified on 2022-01-10</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#EBE3DB] text-xs">
                      <div>
                        <div className="font-bold text-[#211B17]">Educational Qualification Certificate</div>
                        <div className="text-[#70665F]">Verified by HR Manager • Verified on 2022-01-12</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#EBE3DB] text-xs">
                      <div>
                        <div className="font-bold text-[#211B17]">Appointment Letter & NDA Agreement</div>
                        <div className="text-[#70665F]">Signed & Uploaded • Effective Date 2022-01-15</div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">Signed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: PERFORMANCE */}
              {activeTab === 'Performance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-[#70665F]">Overall KPI Performance Score</div>
                      <div className="text-2xl font-bold text-emerald-700 mt-1">94%</div>
                      <div className="text-[11px] text-emerald-600 mt-0.5">Exceeds Expectations</div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                      <div className="text-[#70665F]">Projects / Milestones Delivered</div>
                      <div className="text-2xl font-bold text-indigo-700 mt-1">18 / 19</div>
                      <div className="text-[11px] text-indigo-600 mt-0.5">95% On-Time Delivery Rate</div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="text-[#70665F]">Last Appraisal Review Date</div>
                      <div className="text-lg font-bold text-amber-800 mt-1">June 2026</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">Reviewed by Department Head</div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-[#EBE3DB] space-y-2 text-xs">
                    <div className="font-bold text-[#211B17]">Reviewer & HOD Notes</div>
                    <p className="text-[#544B45]">
                      Consistently demonstrates high technical proficiency and meticulous shop-floor adherence. Maintained zero machine downtime incidents over the last 6 months.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 8: TRAINING */}
              {activeTab === 'Training' && (
                <div className="bg-white rounded-xl border border-[#EBE3DB] overflow-hidden">
                  <div className="p-3 bg-[#FAF7F2] border-b border-[#EBE3DB] font-bold text-xs text-[#211B17]">
                    Assigned & Completed Training Modules
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2]/50 text-[#70665F] border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-3">Training Module</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Completion Date</th>
                        <th className="p-3">Progress</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      <tr>
                        <td className="p-3 font-semibold">ISO 9001:2015 Quality & Safety Standards</td>
                        <td className="p-3 text-[#70665F]">Compliance</td>
                        <td className="p-3 font-mono">2026-03-15</td>
                        <td className="p-3 font-bold text-emerald-600">100%</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Certified</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">CNC / Heavy Machinery Safety Protocols</td>
                        <td className="p-3 text-[#70665F]">Shop Floor Safety</td>
                        <td className="p-3 font-mono">2026-06-20</td>
                        <td className="p-3 font-bold text-emerald-600">100%</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Certified</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold">ERP Foundation & Digital Job Card Tracking</td>
                        <td className="p-3 text-[#70665F]">Operations</td>
                        <td className="p-3 font-mono">In Progress</td>
                        <td className="p-3 font-bold text-indigo-600">80%</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 9: ADVANCES */}
              {activeTab === 'Advances' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                      <div className="text-[#70665F]">Total Approved Advance</div>
                      <div className="text-xl font-bold text-[#211B17] mt-1">₹15,000</div>
                      <div className="text-[11px] text-[#70665F] mt-0.5">Festival Advance</div>
                    </div>
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                      <div className="text-[#70665F]">Monthly EMI Deduction</div>
                      <div className="text-xl font-bold text-amber-700 mt-1">₹3,000 / mo</div>
                      <div className="text-[11px] text-[#70665F] mt-0.5">Deducted from Payroll</div>
                    </div>
                    <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#EBE3DB]">
                      <div className="text-[#70665F]">Remaining Balance</div>
                      <div className="text-xl font-bold text-emerald-700 mt-1">₹6,000</div>
                      <div className="text-[11px] text-emerald-600 mt-0.5">3 Months Remaining</div>
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#EBE3DB] space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>Repayment Progress</span>
                      <span>60% Repaid (₹9,000 / ₹15,000)</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#EBE3DB]">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: EXPENSES */}
              {activeTab === 'Expenses' && (
                <div className="bg-white rounded-xl border border-[#EBE3DB] overflow-hidden">
                  <div className="p-3 bg-[#FAF7F2] border-b border-[#EBE3DB] font-bold text-xs text-[#211B17]">
                    Recent Expense Claims & Travel Reimbursements
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2]/50 text-[#70665F] border-b border-[#EBE3DB]">
                      <tr>
                        <th className="p-3">Claim ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EBE3DB]">
                      <tr>
                        <td className="p-3 font-mono font-bold">EXP-2026-089</td>
                        <td className="p-3 font-mono">2026-09-14</td>
                        <td className="p-3">Site Visit / Machine Installation Travel</td>
                        <td className="p-3 font-bold text-[#211B17]">₹2,450</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Settled / Paid</span></td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold">EXP-2026-074</td>
                        <td className="p-3 font-mono">2026-08-28</td>
                        <td className="p-3">Emergency Tooling Purchase (Shop Floor)</td>
                        <td className="p-3 font-bold text-[#211B17]">₹1,180</td>
                        <td className="p-3"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Settled / Paid</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAB 11: ACTIVITY */}
              {activeTab === 'Activity' && (
                <div className="bg-white p-5 rounded-xl border border-[#EBE3DB] space-y-4 text-xs">
                  <h3 className="font-bold text-[#211B17]">Employee Profile & ERP Activity Audit Trail</h3>
                  <div className="space-y-3 border-l-2 border-pink-300 pl-4 ml-2">
                    <div>
                      <div className="font-semibold text-[#211B17]">Employee Profile Active & Verified</div>
                      <div className="text-[11px] text-[#70665F]">Synchronized with centralized ERP Employee Master</div>
                    </div>
                    <div>
                      <div className="font-semibold text-[#211B17]">Annual Cadre Confirmation & Review</div>
                      <div className="text-[11px] text-[#70665F]">Appraisal completed by HR & General Manager</div>
                    </div>
                    <div>
                      <div className="font-semibold text-[#211B17]">Profile Created in UMA ERP</div>
                      <div className="text-[11px] text-[#70665F]">Employee code assigned: {selectedEmployee.id} on {selectedEmployee.joinedDate || selectedEmployee.joiningDate || '2022-01-15'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#EBE3DB] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10 border border-pink-500/20">
                  <Users className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#211B17]">Add New Employee Profile</h2>
                  <p className="text-xs text-[#70665F]">Fill in employee details to create their ERP profile</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setAddForm(defaultForm); }}
                className="p-2 hover:bg-[#FAF7F2] rounded-lg text-[#70665F] hover:text-[#211B17] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} noValidate className="p-6 space-y-5 text-sm">
              {/* Personal Details */}
              <div>
                <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-pink-400" /> Personal Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">First Name (Letters only, max 50) *</label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={addForm.firstName}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                        setAddForm((f) => ({ ...f, firstName: clean }));
                        if (addErrors.firstName) setAddErrors(prev => ({ ...prev, firstName: '' }));
                      }}
                      placeholder="e.g. Mahesh"
                      className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm ${
                        addErrors.firstName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                      }`}
                    />
                    {addErrors.firstName && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Last Name (Letters only, max 50) *</label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={addForm.lastName}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                        setAddForm((f) => ({ ...f, lastName: clean }));
                        if (addErrors.lastName) setAddErrors(prev => ({ ...prev, lastName: '' }));
                      }}
                      placeholder="e.g. Bariya"
                      className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm ${
                        addErrors.lastName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                      }`}
                    />
                    {addErrors.lastName && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.lastName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Gender *</label>
                    <select
                      required
                      value={addForm.gender}
                      onChange={(e) => setAddForm((f) => ({ ...f, gender: e.target.value as 'male' | 'female' | 'other' }))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Date of Birth (Min 18 Yrs) *</label>
                    <input
                      type="date"
                      required
                      max={maxDob}
                      value={addForm.dob}
                      onChange={(e) => {
                        setAddForm((f) => ({ ...f, dob: e.target.value }));
                        if (addErrors.dob) setAddErrors(prev => ({ ...prev, dob: '' }));
                      }}
                      className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm font-mono ${
                        addErrors.dob ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                      }`}
                    />
                    {addErrors.dob && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.dob}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Mobile (10 Digits) *</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      required
                      value={addForm.mobile}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setAddForm((f) => ({ ...f, mobile: clean }));
                        if (addErrors.mobile) setAddErrors(prev => ({ ...prev, mobile: '' }));
                      }}
                      placeholder="9825000000"
                      className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm font-mono ${
                        addErrors.mobile ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                      }`}
                    />
                    {addErrors.mobile && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.mobile}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={addForm.email}
                      onChange={(e) => {
                        setAddForm((f) => ({ ...f, email: e.target.value }));
                        if (addErrors.email) setAddErrors(prev => ({ ...prev, email: '' }));
                      }}
                      placeholder="employee@uma.com"
                      className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm ${
                        addErrors.email ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                      }`}
                    />
                    {addErrors.email && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Address</label>
                    <input
                      type="text"
                      value={addForm.address}
                      onChange={(e) => setAddForm((f) => ({ ...f, address: e.target.value }))}
                      placeholder="Residential address"
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-crm-brand-500" /> Employment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Department *</label>
                    <select
                      required
                      value={addForm.departmentId}
                      onChange={(e) => {
                        const dept = departments.find((d) => d.id === e.target.value);
                        setAddForm((f) => ({
                          ...f,
                          departmentId: e.target.value,
                          departmentName: dept?.departmentName || e.target.value,
                        }));
                      }}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm"
                    >
                      <option value="">Select Department</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.departmentName || d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Designation *</label>
                    <input
                      type="text"
                      required
                      value={addForm.designation}
                      onChange={(e) => {
                        setAddForm((f) => ({ ...f, designation: e.target.value, roleName: e.target.value }));
                        if (addErrors.designation) setAddErrors(prev => ({ ...prev, designation: '' }));
                      }}
                      placeholder="e.g. Senior Welder"
                      className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm ${
                        addErrors.designation ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                      }`}
                    />
                    {addErrors.designation && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.designation}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Joining Date *</label>
                    <input
                      type="date"
                      required
                      value={addForm.joiningDate}
                      onChange={(e) => setAddForm((f) => ({ ...f, joiningDate: e.target.value }))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Employment Type *</label>
                    <select
                      required
                      value={addForm.employmentType}
                      onChange={(e) => setAddForm((f) => ({ ...f, employmentType: e.target.value as 'full_time' | 'contract' | 'probation' }))}
                      className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm"
                    >
                      <option value="full_time">Full Time Permanent</option>
                      <option value="contract">Contract</option>
                      <option value="probation">Probation</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Login Credentials */}
              <div>
                <h3 className="text-xs font-bold text-[#70665F] uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" /> ERP Login Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={addForm.username}
                      onChange={(e) => {
                        setAddForm((f) => ({ ...f, username: e.target.value }));
                        if (addErrors.username) setAddErrors(prev => ({ ...prev, username: '' }));
                      }}
                      placeholder="e.g. mahesh.bariya"
                      className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm ${
                        addErrors.username ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                      }`}
                    />
                    {addErrors.username && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.username}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#544B45] mb-1">Initial Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={addForm.password}
                        onChange={(e) => {
                          setAddForm((f) => ({ ...f, password: e.target.value }));
                          if (addErrors.password) setAddErrors(prev => ({ ...prev, password: '' }));
                        }}
                        placeholder="Minimum 6 characters"
                        minLength={6}
                        className={`w-full bg-[#FAF7F2] border rounded-lg pl-3 pr-10 py-2 text-[#211B17] focus:outline-none focus:border-pink-500 text-sm ${
                          addErrors.password ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                        }`}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D827A] hover:text-[#211B17] p-1 cursor-pointer transition"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 text-pink-600" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {addErrors.password && (
                      <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3 h-3" /> {addErrors.password}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setAddForm(defaultForm); }}
                  className="px-5 py-2 rounded-lg bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45] font-medium text-sm hover:bg-[#EBE3DB] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSaving}
                  className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-md transition disabled:opacity-60"
                >
                  {addSaving ? 'Saving…' : 'Create Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EBE3DB] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DB]">
              <h2 className="text-base font-bold text-[#211B17] flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-500" />
                Edit Employee: {getEmpName(editingEmployee)} ({editingEmployee.id})
              </h2>
              <button onClick={() => setEditingEmployee(null)} className="text-[#70665F] hover:text-[#211B17]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (!validateEditEmployee()) return;
                const cleanPhone = (editingEmployee.mobile || editingEmployee.phone || '').replace(/\D/g, '').slice(0, 10);
                const fullName = `${editingEmployee.firstName || ''} ${editingEmployee.lastName || ''}`.trim() || editingEmployee.name || 'Staff';
                const selectedDept = departments.find((d) => d.id === editingEmployee.departmentId);
                updateEmployee(editingEmployee.id, {
                  ...editingEmployee,
                  id: editingEmployee.id, // Strictly preserve existing ID
                  mobile: cleanPhone,
                  phone: cleanPhone,
                  email: editingEmployee.email?.trim(),
                  name: fullName,
                  department: selectedDept?.departmentName || editingEmployee.department || 'Production',
                  departmentName: selectedDept?.departmentName || editingEmployee.departmentName || 'Production',
                });
                if (selectedEmployee?.id === editingEmployee.id) {
                  setSelectedEmployee({
                    ...editingEmployee,
                    mobile: cleanPhone,
                    phone: cleanPhone,
                    email: editingEmployee.email?.trim(),
                    name: fullName,
                  });
                }
                setEditingEmployee(null);
                setEditErrors({});
                alert('Employee profile updated successfully without duplicate creation!');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">First Name (Letters only, max 50) *</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={editingEmployee.firstName || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                      setEditingEmployee({ ...editingEmployee, firstName: clean });
                      if (editErrors.firstName) setEditErrors(prev => ({ ...prev, firstName: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] ${
                      editErrors.firstName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.firstName && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Last Name (Letters only, max 50) *</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={editingEmployee.lastName || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                      setEditingEmployee({ ...editingEmployee, lastName: clean });
                      if (editErrors.lastName) setEditErrors(prev => ({ ...prev, lastName: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] ${
                      editErrors.lastName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.lastName && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editingEmployee.email || ''}
                    onChange={(e) => {
                      setEditingEmployee({ ...editingEmployee, email: e.target.value });
                      if (editErrors.email) setEditErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] ${
                      editErrors.email ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.email && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Mobile (10 Digits) *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={editingEmployee.mobile || editingEmployee.phone || ''}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setEditingEmployee({ ...editingEmployee, mobile: clean, phone: clean });
                      if (editErrors.mobile) setEditErrors(prev => ({ ...prev, mobile: '' }));
                    }}
                    className={`w-full bg-[#FAF7F2] border rounded-lg px-3 py-2 text-[#211B17] font-mono ${
                      editErrors.mobile ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-[#EBE3DB]'
                    }`}
                  />
                  {editErrors.mobile && (
                    <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                      <AlertCircle className="w-3 h-3" /> {editErrors.mobile}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Department</label>
                  <select
                    value={editingEmployee.department || editingEmployee.departmentName || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value, departmentName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.departmentName}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={editingEmployee.designation || editingEmployee.role || editingEmployee.roleName || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value, role: e.target.value, roleName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Status</label>
                  <select
                    value={editingEmployee.status || 'Active'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#544B45] mb-1">Joining Date</label>
                  <input
                    type="date"
                    value={editingEmployee.joiningDate || editingEmployee.joinedDate || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, joiningDate: e.target.value, joinedDate: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#EBE3DB] rounded-lg px-3 py-2 text-[#211B17]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#EBE3DB]">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-lg bg-[#FAF7F2] border border-[#EBE3DB] text-[#544B45]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmployeeMasterPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-[#70665F]">Loading Employee Master...</div>}>
      <EmployeeMasterContent />
    </Suspense>
  );
}
