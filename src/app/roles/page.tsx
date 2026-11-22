import { redirect } from 'next/navigation';

// Role Management / Permission Matrix were merged into Users & Employees → Access tab.
export default function Page() {
  redirect('/users');
}
