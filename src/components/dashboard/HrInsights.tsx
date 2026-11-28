'use client';

import React, { useMemo } from 'react';
import { useERP } from '../../context/ERPContext';
import { BarPanel, CHART_COLORS, DonutPanel, count, titleCase } from './DashboardKit';

const todayStr = () => new Date().toISOString().slice(0, 10);

/** HR department charts: headcount, today's attendance, leave requests, payroll trend. */
export function HrInsights() {
  const { employees, attendanceRecords, leaveRequests, payrollRecords } = useERP();

  const d = useMemo(() => {
    const today = todayStr();
    const active = (employees || []).filter((e: any) => (e.status || 'active').toLowerCase() === 'active');
    const headcount = Object.entries(count(active, (e: any) => e.departmentName || e.department || 'Unassigned'))
      .map(([name, employeesCount]) => ({ name, employees: employeesCount }))
      .sort((a, b) => b.employees - a.employees).slice(0, 10);

    const todayRows = (attendanceRecords || []).filter((a: any) => String(a.date).slice(0, 10) === today);
    const attendanceToday = Object.entries(count(todayRows, (a: any) => a.status))
      .map(([name, value]) => ({ name, value }));

    const leaves = Object.entries(count(leaveRequests || [], (l: any) => l.status))
      .map(([name, value]) => ({ name: titleCase(name), value }));

    const payroll: Record<string, { month: string; net: number; gross: number }> = {};
    (payrollRecords || []).forEach((p: any) => {
      const k = p.monthYear || 'Unknown';
      payroll[k] = payroll[k] || { month: k, net: 0, gross: 0 };
      payroll[k].net += Number(p.netSalary) || 0;
      payroll[k].gross += Number(p.grossEarnings) || 0;
    });
    const payrollTrend = Object.values(payroll).slice(-6).map((r) => ({
      month: r.month.replace(/\s\d{4}$/, ''), 'Net salary (₹ thousand)': Math.round(r.net / 1000), 'Gross (₹ thousand)': Math.round(r.gross / 1000),
    }));
    return { headcount, attendanceToday, leaves, payrollTrend };
  }, [employees, attendanceRecords, leaveRequests, payrollRecords]);

  return (
    <div className="px-6 pt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
      <BarPanel title="Headcount by department" data={d.headcount} xKey="name" series={[{ key: 'employees', label: 'Employees' }]} height={220} />
      <DonutPanel title="Today's attendance" data={d.attendanceToday} height={220} centerLabel="punched" />
      <DonutPanel title="Leave requests" data={d.leaves} height={220} centerLabel="requests" />
      <BarPanel title="Payroll trend" subtitle="₹ thousand, last 6 months" data={d.payrollTrend} xKey="month" height={220}
        series={[{ key: 'Net salary (₹ thousand)', label: 'Net', color: CHART_COLORS[1] }, { key: 'Gross (₹ thousand)', label: 'Gross', color: CHART_COLORS[0] }]} />
    </div>
  );
}
