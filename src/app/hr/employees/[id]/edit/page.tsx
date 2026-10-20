'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useERP } from '../../../../../context/ERPContext';
import {
  ERPFormLayout,
  ERPFormSection,
  ERPFormGrid,
  ERPInput,
  ERPSelect,
  ERPCheckbox,
} from '../../../../../components/ui/ERPFormLayout';
import { toast } from '../../../../../context/ToastContext';

const ALL_ERP_MODULES = [
  { id: 'crm', label: 'CRM & Sales' },
  { id: 'projects', label: 'Projects & Planning' },
  { id: 'design', label: 'Designer & BOM' },
  { id: 'purchase', label: 'Purchase & RFQ' },
  { id: 'store', label: 'Store & Inventory' },
  { id: 'production', label: 'Production & Shop Floor' },
  { id: 'quality', label: 'Quality Inspection' },
  { id: 'maintenance', label: 'Plant Maintenance' },
  { id: 'hr', label: 'HR & Payroll' },
  { id: 'accounting', label: 'Accounts & Finance' },
];

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const rawId = params?.id as string;
  const decodedId = rawId ? decodeURIComponent(rawId) : '';

  const { availableEmployees, departments, designations, updateEmployee } = useERP();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    id: '',
    firstName: '',
    lastName: '',
    gender: 'male' as 'male' | 'female' | 'other',
    dob: '1995-01-01',
    mobile: '',
    email: '',
    address: '',
    workLocation: 'Plant Unit-1 (Sanand)',
    emergencyContact: '',
    departmentId: '',
    departmentName: '',
    designation: '',
    roleId: '',
    roleName: '',
    roleType: 'employee' as 'super_admin' | 'admin' | 'department_manager' | 'employee',
    dataScope: 'department' as 'own' | 'assigned' | 'department' | 'all',
    reportingManagerId: '',
    joiningDate: '',
    employmentType: 'full_time' as 'full_time' | 'contract' | 'probation',
    status: 'Active',
    username: '',
    canAssignTasks: false,
    canApproveLeaves: false,
    canManageAttendance: false,
    canExportData: false,
    assignedModules: ['production'] as string[],
  });

  useEffect(() => {
    if (!decodedId || availableEmployees.length === 0) return;

    const emp = availableEmployees.find(
      e => e.id === decodedId || e.id?.toLowerCase() === decodedId?.toLowerCase()
    );

    if (emp) {
      setForm({
        id: emp.id,
        firstName: emp.firstName || emp.name?.split(' ')[0] || '',
        lastName: emp.lastName || emp.name?.split(' ').slice(1).join(' ') || '',
        gender: (emp.gender as any) || 'male',
        dob: emp.dob || '1995-01-01',
        mobile: emp.mobile || emp.phone || '',
        email: emp.email || '',
        address: emp.address || '',
        workLocation: emp.workLocation || 'Plant Unit-1 (Sanand)',
        emergencyContact: emp.emergencyContact || '',
        departmentId: emp.departmentId || departments[0]?.id || '',
        departmentName: emp.departmentName || emp.department || 'Production',
        designation: emp.designation || emp.role || 'Staff',
        roleId: emp.roleId || '',
        roleName: emp.roleName || emp.designation || 'Staff',
        roleType: (emp.roleType as any) || 'employee',
        dataScope: (emp.dataScope as any) || 'department',
        reportingManagerId: emp.reportingManagerId || '',
        joiningDate: emp.joiningDate || emp.joinedDate || '',
        employmentType: (emp.employmentType as any) || 'full_time',
        status: emp.status || 'Active',
        username: emp.username || emp.id,
        canAssignTasks: Boolean(emp.canAssignTasks),
        canApproveLeaves: Boolean(emp.canApproveLeaves),
        canManageAttendance: Boolean(emp.canManageAttendance),
        canExportData: Boolean(emp.canExportData),
        assignedModules: Array.isArray(emp.assignedModules) && emp.assignedModules.length > 0 ? emp.assignedModules : ['production'],
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [decodedId, availableEmployees, departments]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
    if (!form.email.trim()) errs.email = 'Email is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      toast.warning('Please correct the validation errors before saving.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedDept = departments.find(d => d.id === form.departmentId);
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      const cleanPhone = form.mobile.replace(/\D/g, '').slice(0, 10);

      updateEmployee(form.id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        name: fullName,
        gender: form.gender,
        dob: form.dob,
        mobile: cleanPhone,
        phone: cleanPhone,
        email: form.email.trim(),
        address: form.address,
        workLocation: form.workLocation,
        emergencyContact: form.emergencyContact,
        departmentId: form.departmentId,
        departmentName: selectedDept?.departmentName || form.departmentName,
        department: selectedDept?.departmentName || form.departmentName,
        designation: form.designation,
        roleId: form.roleId || form.roleName,
        roleName: form.roleName || form.designation,
        role: form.roleName || form.designation,
        roleType: form.roleType,
        dataScope: form.dataScope,
        reportingManagerId: form.reportingManagerId,
        joiningDate: form.joiningDate,
        joinedDate: form.joiningDate,
        employmentType: form.employmentType,
        status: form.status,
        canAssignTasks: form.canAssignTasks,
        canApproveLeaves: form.canApproveLeaves,
        canManageAttendance: form.canManageAttendance,
        canExportData: form.canExportData,
        assignedModules: form.assignedModules,
      } as any);

      toast.success(`Employee ${fullName} updated successfully!`);
      router.push('/hr/employees');
    } catch (err: any) {
      toast.error(`Error updating employee: ${err.message || 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading employee data for {decodedId}...
      </div>
    );
  }

  const deptOptions = departments.map(d => ({
    label: d.departmentName || d.name || 'Department',
    value: d.id,
  }));

  const designationList = designations.length > 0
    ? designations.map(d => ({ label: d.designationName, value: d.designationName }))
    : [
        { label: 'Director / Management', value: 'Director' },
        { label: 'Plant Manager', value: 'Plant Manager' },
        { label: 'Production Engineer', value: 'Production Engineer' },
        { label: 'Quality Inspector', value: 'Quality Inspector' },
        { label: 'Purchase Executive', value: 'Purchase Executive' },
        { label: 'Store Manager', value: 'Store Manager' },
        { label: 'Accountant', value: 'Accountant' },
        { label: 'HR Officer', value: 'HR Officer' },
        { label: 'Sales Executive', value: 'Sales Executive' },
      ];

  const managerOptions = [
    { label: 'None / Top Management', value: '' },
    ...availableEmployees
      .filter(e => e.id !== form.id)
      .map(e => ({
        label: `${e.name || `${e.firstName} ${e.lastName}`} (${e.department || 'Staff'})`,
        value: e.id,
      })),
  ];

  return (
    <ERPFormLayout
      breadcrumbs={['DASHBOARD', 'HR & PAYROLL', 'EMPLOYEE MASTER', form.id || 'UPDATE']}
      onCancel={() => router.push('/hr/employees')}
      onSaveDraft={() => handleUpdate()}
      onSubmit={handleUpdate}
      isSubmitting={submitting}
    >
      {/* SECTION 1: PERSONAL & CONTACT */}
      <ERPFormSection title="1. Personal & Contact Details">
        <ERPFormGrid>
          <ERPInput
            label="First Name"
            required
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            error={errors.firstName}
          />
          <ERPInput
            label="Last Name"
            required
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            error={errors.lastName}
          />
          <ERPSelect
            label="Gender"
            required
            value={form.gender}
            onChange={e => setForm({ ...form, gender: e.target.value as any })}
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ]}
          />
          <ERPInput
            label="Date of Birth"
            type="date"
            required
            value={form.dob}
            onChange={e => setForm({ ...form, dob: e.target.value })}
          />
          <ERPInput
            label="Mobile Number (10 digits)"
            required
            value={form.mobile}
            onChange={e => setForm({ ...form, mobile: e.target.value })}
            error={errors.mobile}
          />
          <ERPInput
            label="Official / Personal Email"
            type="email"
            required
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />
          <ERPInput
            label="Work Location / Unit"
            value={form.workLocation}
            onChange={e => setForm({ ...form, workLocation: e.target.value })}
          />
          <ERPInput
            label="Emergency Contact No."
            value={form.emergencyContact}
            onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
          />
        </ERPFormGrid>

        <div className="mt-4">
          <ERPInput
            label="Residential / Permanent Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />
        </div>
      </ERPFormSection>

      {/* SECTION 2: EMPLOYMENT & ROLE */}
      <ERPFormSection title="2. Department, Role & Employment Details">
        <ERPFormGrid>
          <ERPSelect
            label="Department"
            required
            value={form.departmentId}
            onChange={e => {
              const v = e.target.value;
              const selectedDept = departments.find(d => d.id === v);
              setForm({
                ...form,
                departmentId: v,
                departmentName: selectedDept?.departmentName || selectedDept?.name || v,
              });
            }}
            options={deptOptions.length > 0 ? deptOptions : [{ label: 'Production', value: 'prod' }]}
          />
          <ERPSelect
            label="Designation"
            required
            value={form.designation}
            onChange={e => setForm({ ...form, designation: e.target.value, roleName: e.target.value })}
            options={designationList}
          />
          <ERPSelect
            label="Role Hierarchy Level"
            required
            value={form.roleType}
            onChange={e => setForm({ ...form, roleType: e.target.value as any })}
            options={[
              { label: '4. Staff User (Standard)', value: 'employee' },
              { label: '3. Department Manager (Approvals)', value: 'department_manager' },
              { label: '2. Admin (Department Operations)', value: 'admin' },
              { label: '1. Super Admin (Full Enterprise)', value: 'super_admin' },
            ]}
          />
          <ERPSelect
            label="Data Scope & Visibility"
            required
            value={form.dataScope}
            onChange={e => setForm({ ...form, dataScope: e.target.value as any })}
            options={[
              { label: 'Self Only (Personal Profile)', value: 'own' },
              { label: 'Assigned Records Only', value: 'assigned' },
              { label: 'Department Scope (Full Dept)', value: 'department' },
              { label: 'Enterprise All (All Branches)', value: 'all' },
            ]}
          />
          <ERPSelect
            label="Employment Type"
            value={form.employmentType}
            onChange={e => setForm({ ...form, employmentType: e.target.value as any })}
            options={[
              { label: 'Full Time (Permanent)', value: 'full_time' },
              { label: 'Contractual Worker', value: 'contract' },
              { label: 'Probation / Trainee', value: 'probation' },
            ]}
          />
          <ERPInput
            label="Joining Date"
            type="date"
            required
            value={form.joiningDate}
            onChange={e => setForm({ ...form, joiningDate: e.target.value })}
          />
          <ERPSelect
            label="Reporting Manager"
            value={form.reportingManagerId}
            onChange={e => setForm({ ...form, reportingManagerId: e.target.value })}
            options={managerOptions}
          />
          <ERPSelect
            label="Employment Status"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            options={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive / Suspended', value: 'Inactive' },
              { label: 'On Leave', value: 'On Leave' },
              { label: 'Terminated', value: 'Terminated' },
            ]}
          />
        </ERPFormGrid>
      </ERPFormSection>

      {/* SECTION 3: SYSTEM CREDENTIALS & ACCESS */}
      <ERPFormSection title="3. System Credentials & ERP Module Access">
        <ERPFormGrid>
          <ERPInput
            label="ERP Username / Login ID"
            disabled
            value={form.username}
            onChange={() => {}}
          />
        </ERPFormGrid>

        {/* Operational Authorities Checkboxes */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
            Operational Authorities & Permissions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ERPCheckbox
              label="Can Assign Tasks"
              checked={form.canAssignTasks}
              onChange={v => setForm({ ...form, canAssignTasks: v })}
            />
            <ERPCheckbox
              label="Can Approve Leaves"
              checked={form.canApproveLeaves}
              onChange={v => setForm({ ...form, canApproveLeaves: v })}
            />
            <ERPCheckbox
              label="Can Manage Attendance"
              checked={form.canManageAttendance}
              onChange={v => setForm({ ...form, canManageAttendance: v })}
            />
            <ERPCheckbox
              label="Can Export Reports"
              checked={form.canExportData}
              onChange={v => setForm({ ...form, canExportData: v })}
            />
          </div>
        </div>

        {/* Module Access Checkboxes */}
        <div className="mt-4 p-4 rounded-xl bg-purple-50/40 border border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
              Authorized ERP Workspace Modules
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForm(prev => ({
                    ...prev,
                    assignedModules: ALL_ERP_MODULES.map(m => m.id),
                  }));
                }}
                className="text-xs text-purple-700 hover:underline font-semibold cursor-pointer"
              >
                Select All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {ALL_ERP_MODULES.map(mod => {
              const isChecked = form.assignedModules.includes(mod.id);
              return (
                <ERPCheckbox
                  key={mod.id}
                  label={mod.label}
                  checked={isChecked}
                  onChange={checked => {
                    const next = checked
                      ? Array.from(new Set([...form.assignedModules, mod.id]))
                      : form.assignedModules.filter(m => m !== mod.id);
                    setForm({ ...form, assignedModules: next });
                  }}
                />
              );
            })}
          </div>
        </div>
      </ERPFormSection>
    </ERPFormLayout>
  );
}
