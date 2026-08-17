import type { PaymentMode, ExpenseCategory } from '@/types';

// ─── Payment Modes ──────────────────────────────────────────────────

export const PAYMENT_MODES: { value: PaymentMode; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash', icon: 'Banknote' },
  { value: 'upi', label: 'UPI', icon: 'Smartphone' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: 'Building2' },
  { value: 'cheque', label: 'Cheque', icon: 'FileText' },
  { value: 'other', label: 'Other', icon: 'Wallet' },
];

// ─── Payment Mode Colors (for charts) ──────────────────────────────

export const PAYMENT_MODE_COLORS: Record<PaymentMode, string> = {
  cash: '#22C55E',
  upi: '#8B5CF6',
  bank_transfer: '#3B82F6',
  cheque: '#F59E0B',
  other: '#6B7280',
};

// ─── Default Expense Categories ─────────────────────────────────────

export const DEFAULT_EXPENSE_CATEGORIES: Omit<ExpenseCategory, 'id'>[] = [
  { name: 'Idol', icon: 'Crown', isSystem: true, isActive: true, sortOrder: 1 },
  { name: 'Decoration', icon: 'Sparkles', isSystem: true, isActive: true, sortOrder: 2 },
  { name: 'Lighting', icon: 'Lightbulb', isSystem: true, isActive: true, sortOrder: 3 },
  { name: 'Electrical', icon: 'Zap', isSystem: true, isActive: true, sortOrder: 4 },
  { name: 'Sound System', icon: 'Volume2', isSystem: true, isActive: true, sortOrder: 5 },
  { name: 'Food', icon: 'UtensilsCrossed', isSystem: true, isActive: true, sortOrder: 6 },
  { name: 'Prasadam', icon: 'Cookie', isSystem: true, isActive: true, sortOrder: 7 },
  { name: 'Pooja Materials', icon: 'Flame', isSystem: true, isActive: true, sortOrder: 8 },
  { name: 'Flowers', icon: 'Flower2', isSystem: true, isActive: true, sortOrder: 9 },
  { name: 'Tent / Chairs', icon: 'Tent', isSystem: true, isActive: true, sortOrder: 10 },
  { name: 'Cultural Programs', icon: 'Music', isSystem: true, isActive: true, sortOrder: 11 },
  { name: 'Transportation', icon: 'Truck', isSystem: true, isActive: true, sortOrder: 12 },
  { name: 'Cleaning', icon: 'Trash2', isSystem: true, isActive: true, sortOrder: 13 },
  { name: 'Printing', icon: 'Printer', isSystem: true, isActive: true, sortOrder: 14 },
  { name: 'Flex / Banners', icon: 'Flag', isSystem: true, isActive: true, sortOrder: 15 },
  { name: 'Gifts / Prizes', icon: 'Gift', isSystem: true, isActive: true, sortOrder: 16 },
  { name: 'Miscellaneous', icon: 'MoreHorizontal', isSystem: true, isActive: true, sortOrder: 99 },
];

// ─── Category Colors (for charts) ──────────────────────────────────

export const CATEGORY_COLORS = [
  '#D4A843', '#FF6B2B', '#7B2D3A', '#22C55E', '#8B5CF6',
  '#3B82F6', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899',
  '#10B981', '#F97316', '#6366F1', '#14B8A6', '#A855F7',
  '#E11D48', '#6B7280',
];

// ─── Roles ──────────────────────────────────────────────────────────

export const ROLES = {
  admin: {
    label: 'Admin',
    description: 'Full access to all features',
    color: '#D4A843',
  },
  treasurer: {
    label: 'Treasurer',
    description: 'Financial management access',
    color: '#22C55E',
  },
  volunteer: {
    label: 'Volunteer',
    description: 'Collection and event access',
    color: '#3B82F6',
  },
} as const;

// ─── Transaction Status ─────────────────────────────────────────────

export const TRANSACTION_STATUSES = {
  active: { label: 'Active', color: '#22C55E', bgColor: '#22C55E20' },
  pending_cancellation: { label: 'Pending Cancellation', color: '#F59E0B', bgColor: '#F59E0B20' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bgColor: '#EF444420' },
} as const;

// ─── Moon Progress Phases ───────────────────────────────────────────

export const MOON_PHASES = [
  { phase: '🌑', label: 'Planning', description: 'Setting up the celebration' },
  { phase: '🌒', label: 'Preparation', description: 'Organizing committees and tasks' },
  { phase: '🌓', label: 'Collection', description: 'Gathering community support' },
  { phase: '🌔', label: 'Celebration', description: 'The festivities begin' },
  { phase: '🌕', label: 'Grand Festival', description: 'Peak of the celebration' },
  { phase: '🌖', label: 'Visarjan', description: 'A graceful conclusion' },
] as const;

// ─── Event Defaults ─────────────────────────────────────────────────

export const DEFAULT_EVENTS = [
  'Ganesh Idol Installation',
  'Ganesh Sthapana',
  'Daily Pooja',
  'Bhajans',
  'Annadanam',
  'Cultural Program',
  'Games',
  'Special Pooja',
  'Visarjan / Nimajjanam',
];

// ─── App Constants ──────────────────────────────────────────────────

export const APP_NAME = 'Moon Friends';
export const EVENT_NAME = 'Vinayaka Chavithi 2026';
export const EVENT_YEAR = 2026;
export const TAGLINE = 'Together in devotion. Together as a community.';
export const CURRENCY_SYMBOL = '₹';
export const PAISE_PER_RUPEE = 100;

// ─── Firestore Collection Names ─────────────────────────────────────

export const COLLECTIONS = {
  USERS: 'users',
  CONTRIBUTORS: 'contributors',
  COLLECTION_TRANSACTIONS: 'collections',
  EXPENSE_TRANSACTIONS: 'expenses',
  EXPENSE_CATEGORIES: 'expense_categories',
  AUDIT_LOGS: 'audit_logs',
  EVENTS: 'events',
  VOLUNTEERS: 'volunteers',
  INVENTORY: 'inventory',
  ANNOUNCEMENTS: 'announcements',
  DAILY_CLOSINGS: 'daily_closings',
  SETTINGS: 'settings',
  FINANCIAL_SUMMARY: '_financial_summary',
  COUNTERS: '_counters',
} as const;
