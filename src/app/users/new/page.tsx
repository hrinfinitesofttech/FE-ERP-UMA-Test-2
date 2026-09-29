'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useERP } from '../../../context/ERPContext';
import { ArrowLeft, UserPlus, Shield, Building, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function NewUserPage() {
  const router = useRouter();
  const { addEmployee, departments, roles, employees } = useERP();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const todayStr = new Date().toISOString().split('T')[0];
  const maxDobDate = new Date();
  maxDobDate.setFullYear(maxDobDate.getFullYear() - 18);
  const maxDob = maxDobDate.toISOString().split('T')[0];
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dob: '1995-01-01',
    mobile: '',
    email: '',
    address: '',
    departmentId: departments[0]?.id || 'dept-crm',
    designation: '',
    roleId: roles[0]?.id || 'role-crm-employee',
    reportingManagerId: employees[0]?.id || '',
    joiningDate: todayStr,
    employmentType: 'full_time' as 'full_time' | 'contract' | 'probation',
    status: 'active' as 'active' | 'inactive',
    username: '',
    password: 'password123',
    isFamilyMember: false,
  });

  const nameRegex = /^[a-zA-Z\s]+$/;

  const validateForm = () => {
    const errs: Record<string, string> = {};
    const firstNameTrim = formData.firstName.trim();
    if (!firstNameTrim) {
      errs.firstName = 'First name is required.';
    } else if (!nameRegex.test(firstNameTrim)) {
      errs.firstName = 'First name can only contain letters.';
    } else if (firstNameTrim.length < 2) {
      errs.firstName = 'First name must be at least 2 characters.';
    } else if (firstNameTrim.length > 50) {
      errs.firstName = 'First name cannot exceed 50 characters.';
    }

    const lastNameTrim = formData.lastName.trim();
    if (!lastNameTrim) {
      errs.lastName = 'Last name is required.';
    } else if (!nameRegex.test(lastNameTrim)) {
      errs.lastName = 'Last name can only contain letters.';
    } else if (lastNameTrim.length < 2) {
      errs.lastName = 'Last name must be at least 2 characters.';
    } else if (lastNameTrim.length > 50) {
      errs.lastName = 'Last name cannot exceed 50 characters.';
    }
    
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      errs.mobile = 'Mobile number is required.';
    } else if (cleanMobile.length !== 10) {
      errs.mobile = 'Mobile number must be exactly 10 digits.';
    }

    const emailTrim = formData.email.trim();
    if (!emailTrim) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(emailTrim)) {
      errs.email = 'Enter a valid email with a domain (e.g. employee@uma.com).';
    }

    if (formData.dob && formData.dob > maxDob) {
      errs.dob = 'Employee must be at least 18 years old.';
    }

    if (!formData.username.trim()) errs.username = 'System username is required.';
    if (!formData.password || formData.password.length < 6) errs.password = 'Password must be at least 6 characters.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dept = departments.find((d) => d.id === formData.departmentId);
    const role = roles.find((r) => r.id === formData.roleId);
    const mgr = employees.find((emp) => emp.id === formData.reportingManagerId);

    addEmployee({
      ...formData,
      mobile: formData.mobile.replace(/\D/g, '').slice(0, 10),
      email: formData.email.trim(),
      departmentName: dept?.name || 'CRM & Sales',
      roleName: role?.name || 'CRM Employee',
      reportingManagerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : undefined,
    });

    router.push('/users');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-xs pb-10">
      <Link href="/users" className="inline-flex items-center gap-1.5 text-crm-brand-700 hover:underline font-semibold">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Employee Directory
      </Link>

      <div className="bg-white dark:bg-white border border-slate-200 dark:border-[#EBE3DB] rounded-2xl p-6 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-[#EBE3DB] pb-4">
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#211B17] flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-crm-brand-700" />
            New Employee Registration
          </h1>
          <p className="text-[#70665F] mt-0.5">
            Fill in personal, organizational and access control details to onboard an employee.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* SECTION 1: BASIC INFO */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand- text-crm-brand- flex items-center justify-center text-[10px]">1</span>
              Basic Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">First Name (Letters only, max 50) *</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={formData.firstName}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                    setFormData({ ...formData, firstName: clean });
                    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                  }}
                  placeholder="e.g. Ramesh"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg text-slate-900 dark:text-[#211B17] ${
                    errors.firstName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-[#EBE3DB]'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Last Name (Letters only, max 50) *</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={formData.lastName}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
                    setFormData({ ...formData, lastName: clean });
                    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                  }}
                  placeholder="e.g. Patel"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg text-slate-900 dark:text-[#211B17] ${
                    errors.lastName ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-[#EBE3DB]'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {errors.lastName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Mobile Number (10 Digits) *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  value={formData.mobile}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobile: clean });
                    if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
                  }}
                  placeholder="9825012345"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg text-slate-900 dark:text-[#211B17] font-mono ${
                    errors.mobile ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-[#EBE3DB]'
                  }`}
                />
                {errors.mobile && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {errors.mobile}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="name@umatechnofab.com"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg text-slate-900 dark:text-[#211B17] ${
                    errors.email ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-[#EBE3DB]'
                  }`}
                />
                {errors.email && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Date of Birth (Min 18 Yrs)</label>
                <input
                  type="date"
                  max={maxDob}
                  value={formData.dob}
                  onChange={(e) => {
                    setFormData({ ...formData, dob: e.target.value });
                    if (errors.dob) setErrors(prev => ({ ...prev, dob: '' }));
                  }}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border rounded-lg text-slate-900 dark:text-[#211B17] font-mono ${
                    errors.dob ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200 dark:border-[#EBE3DB]'
                  }`}
                />
                {errors.dob && (
                  <p className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3 h-3" /> {errors.dob}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Residential Address, City, Pincode"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
              />
            </div>
          </div>

          {/* SECTION 2: ORGANIZATION HIERARCHY */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand- text-crm-brand- flex items-center justify-center text-[10px]">2</span>
              Organization & Role Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Sales Executive / Quality Inspector"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Assigned Role *</label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17] font-mono"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Reporting Manager</label>
                <select
                  value={formData.reportingManagerId}
                  onChange={(e) => setFormData({ ...formData, reportingManagerId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                >
                  <option value="">None (Top Level)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.designation})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                >
                  <option value="full_time">Full Time Regular</option>
                  <option value="contract">Contractor</option>
                  <option value="probation">Probationary</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: LOGIN CREDENTIALS */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <h3 className="font-bold text-sm text-slate-800 dark:text-[#544B45] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-crm-brand- text-crm-brand- flex items-center justify-center text-[10px]">3</span>
              Login Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">System Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. ramesh.sales"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17] font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-[#544B45] font-semibold mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-[#FAF7F2] border border-slate-200 dark:border-[#EBE3DB] rounded-lg text-slate-900 dark:text-[#211B17]"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8D827A] hover:text-[#211B17] p-1 cursor-pointer transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-crm-brand-700" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-[#544B45]">
                <input
                  type="checkbox"
                  checked={formData.isFamilyMember}
                  onChange={(e) => setFormData({ ...formData, isFamilyMember: e.target.checked })}
                  className="rounded border-slate-300 text-crm-brand-700 focus:ring-crm-brand-600"
                />
                <span className="font-semibold">Company Owner / Family Member (Grants higher Admin privileges)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-[#EBE3DB]">
            <Link
              href="/users"
              className="px-4 py-2 border border-slate-200 dark:border-[#EBE3DB] text-slate-600 dark:text-[#544B45] rounded-lg hover:bg-slate-100 font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-crm-brand-700 hover:bg-crm-brand-800 text-white rounded-lg font-bold shadow-md transition"
            >
              Register & Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
