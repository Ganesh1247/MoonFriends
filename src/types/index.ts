import { Timestamp } from 'firebase/firestore';

// ─── Enums & Constants ───────────────────────────────────────────────

export type UserRole = 'admin' | 'treasurer' | 'volunteer';

export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'other';

export type TransactionStatus = 'active' | 'pending_cancellation' | 'cancelled';

export type AuditAction = 'CREATED' | 'UPDATED' | 'CANCELLED' | 'APPROVED' | 'REJECTED';

export type EntityType = 'collection' | 'expense' | 'daily_closing' | 'user' | 'settings';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

// ─── User ────────────────────────────────────────────────────────────

export interface AppUser {
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Contributor ─────────────────────────────────────────────────────

export interface Contributor {
  id: string;
  name: string;
  houseNumber: string;
  phone: string;
  totalContribution: number; // Paise (integer)
  contributionCount: number;
  latestContribution: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Collection Transaction ─────────────────────────────────────────

export interface CollectionTransaction {
  id: string;
  transactionId: string; // "COL-2026-0001"
  contributorId: string;
  contributorName: string;
  houseNumber: string;
  amount: number; // Paise (integer)
  paymentMode: PaymentMode;
  collectionDate: string; // "2026-08-17"
  collectionTime: string; // "14:30"
  note: string;
  receiptNumber: string;
  receiptImageUrl?: string;
  collectedBy: string; // User UID
  collectedByName: string;
  status: TransactionStatus;
  createdBy: string;
  createdByName: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Expense Transaction ────────────────────────────────────────────

export interface ExpenseTransaction {
  id: string;
  transactionId: string; // "EXP-2026-0001"
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number; // Paise (integer)
  paymentMode: PaymentMode;
  paidTo: string;
  expenseDate: string;
  expenseTime: string;
  note: string;
  billImageUrl?: string;
  status: TransactionStatus;
  createdBy: string;
  createdByName: string;
  updatedBy?: string;
  updatedByName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Expense Category ───────────────────────────────────────────────

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  isSystem: boolean;
  isActive: boolean;
  sortOrder: number;
}

// ─── Audit Log ──────────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  entityType: EntityType;
  entityId: string;
  transactionId?: string;
  action: AuditAction;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  reason: string;
  performedBy: string;
  performedByName: string;
  performedByRole: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}

// ─── Event Schedule ─────────────────────────────────────────────────

export interface EventSchedule {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  responsiblePerson: string;
  description: string;
  status: EventStatus;
  sortOrder: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Volunteer ──────────────────────────────────────────────────────

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  responsibility: string;
  assignedEventId?: string;
  assignedEventName?: string;
  availabilityStart: string;
  availabilityEnd: string;
  notes?: string;
  createdAt: Timestamp;
}

// ─── Inventory ──────────────────────────────────────────────────────

export interface InventoryItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  purchasedQty: number;
  usedQty: number;
  remainingQty: number;
  purchaseCost: number; // Paise
  supplier?: string;
  expenseId?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Announcement ───────────────────────────────────────────────────

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  publishedAt?: Timestamp;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
}

// ─── Daily Closing ──────────────────────────────────────────────────

export interface DailyClosing {
  id: string;
  date: string;
  openingBalance: number; // Paise
  collectionsTotal: number;
  expensesTotal: number;
  closingBalance: number;
  confirmedBy?: string;
  confirmedByName?: string;
  confirmedAt?: Timestamp;
  notes?: string;
  createdAt: Timestamp;
}

// ─── Financial Summary ──────────────────────────────────────────────

export interface FinancialSummary {
  totalCollections: number; // Paise
  totalExpenses: number; // Paise
  availableBalance: number; // Paise (auto-calculated)
  contributorCount: number;
  collectionCount: number;
  expenseCount: number;
  lastUpdated: Timestamp;
}

// ─── Counter ────────────────────────────────────────────────────────

export interface Counter {
  nextId: number;
}

// ─── Form Data Types (for form submissions, amounts in rupees) ─────

export interface CollectionFormData {
  contributorName: string;
  houseNumber: string;
  phone: string;
  amount: number; // Rupees (will be converted to paise)
  paymentMode: PaymentMode;
  collectionDate: string;
  collectionTime: string;
  note: string;
  receiptImage?: File;
}

export interface ExpenseFormData {
  categoryId: string;
  description: string;
  amount: number; // Rupees
  paymentMode: PaymentMode;
  paidTo: string;
  expenseDate: string;
  expenseTime: string;
  note: string;
  billImage?: File;
}

export interface EventFormData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  responsiblePerson: string;
  description: string;
  status: EventStatus;
}

export interface VolunteerFormData {
  name: string;
  phone: string;
  responsibility: string;
  assignedEventId?: string;
  availabilityStart: string;
  availabilityEnd: string;
  notes?: string;
}

// ─── API Response Types ─────────────────────────────────────────────

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, string>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Dashboard Chart Data ───────────────────────────────────────────

export interface PaymentModeBreakdown {
  mode: PaymentMode;
  label: string;
  amount: number;
  count: number;
  color: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  icon: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  collections: number;
  expenses: number;
  balance: number;
}
