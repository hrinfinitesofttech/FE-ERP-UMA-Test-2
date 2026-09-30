import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: any): string {
  const num = Number(amount);
  const safeAmount = isNaN(num) ? 0 : num;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safeAmount);
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const trimmed = String(dateString).trim();
    const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = dateMatch[1];
      const monthIdx = parseInt(dateMatch[2], 10) - 1;
      const day = dateMatch[3];
      const month = MONTHS_SHORT[monthIdx] || dateMatch[2];
      return `${day} ${month} ${year}`;
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = MONTHS_SHORT[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '';
  try {
    const trimmed = String(dateTimeString).trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (match) {
      const year = match[1];
      const monthIdx = parseInt(match[2], 10) - 1;
      const day = match[3];
      const month = MONTHS_SHORT[monthIdx] || match[2];
      let hours = parseInt(match[4], 10);
      const minutes = match[5];
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = String(hours).padStart(2, '0');
      return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
    }

    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = MONTHS_SHORT[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = String(hours).padStart(2, '0');
    return `${day} ${month} ${year}, ${strHours}:${minutes} ${ampm}`;
  } catch {
    return dateTimeString;
  }
}
