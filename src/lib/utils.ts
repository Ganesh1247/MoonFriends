import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { CURRENCY_SYMBOL, PAISE_PER_RUPEE, EVENT_YEAR } from './constants';

// ─── Tailwind Class Merger ──────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Currency Formatting ────────────────────────────────────────────

export function paiseToRupees(paise: number): number {
  return paise / PAISE_PER_RUPEE;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * PAISE_PER_RUPEE);
}

export function formatCurrency(paise: number): string {
  const rupees = paiseToRupees(paise);
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: rupees % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
  return `${CURRENCY_SYMBOL}${formatted}`;
}

export function formatRupees(rupees: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: rupees % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
  return `${CURRENCY_SYMBOL}${formatted}`;
}

export function formatCurrencyCompact(paise: number): string {
  const rupees = paiseToRupees(paise);
  if (rupees >= 100000) {
    return `${CURRENCY_SYMBOL}${(rupees / 100000).toFixed(1)}L`;
  }
  if (rupees >= 1000) {
    return `${CURRENCY_SYMBOL}${(rupees / 1000).toFixed(1)}K`;
  }
  return formatCurrency(paise);
}

// ─── Transaction ID ─────────────────────────────────────────────────

export function generateTransactionId(type: 'COL' | 'EXP', seq: number): string {
  return `${type}-${EVENT_YEAR}-${String(seq).padStart(4, '0')}`;
}

export function parseTransactionId(txId: string) {
  const parts = txId.split('-');
  return {
    type: parts[0] as 'COL' | 'EXP',
    year: parseInt(parts[1], 10),
    seq: parseInt(parts[2], 10),
  };
}

// ─── Date Formatting ────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatTimestamp(timestamp: { seconds: number; nanoseconds: number }): string {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  return format(date, 'dd MMM yyyy, hh:mm a');
}

export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm');
}

// ─── Validation Helpers ─────────────────────────────────────────────

export function isValidNote(note: string | null | undefined): boolean {
  return typeof note === 'string' && note.trim().length > 0;
}

export function isValidAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && isFinite(amount);
}

// ─── Phone Formatting ───────────────────────────────────────────────

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
}

// ─── String Helpers ─────────────────────────────────────────────────

export function titleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPaymentModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    other: 'Other',
  };
  return labels[mode] || mode;
}
