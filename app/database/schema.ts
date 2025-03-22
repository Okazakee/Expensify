export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
}

export interface RecurringTransaction {
  id: string;
  amount: number;
  isIncome: boolean;
  note: string;
  category: string;
  recurrenceType: 'weekly' | 'monthly' | 'yearly';
  day?: number;
  month?: number;
  weekday?: number;
  lastProcessed?: string;
  nextDue?: string;
  active: boolean;
}

export const DATABASE_NAME = 'expensify.db';

export const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL
  );
`;

export const CREATE_EXPENSES_TABLE = `
  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    FOREIGN KEY (category) REFERENCES categories (id)
  );
`;

export const CREATE_RECURRING_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS recurring_transactions (
    id TEXT PRIMARY KEY NOT NULL,
    amount REAL NOT NULL,
    isIncome INTEGER NOT NULL,
    note TEXT,
    category TEXT,
    recurrenceType TEXT NOT NULL,
    day INTEGER,
    month INTEGER,
    weekday INTEGER,
    lastProcessed TEXT,
    nextDue TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (category) REFERENCES categories (id)
  );
`;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food', color: '#50E3C2', icon: 'fast-food' },
  { id: 'transport', name: 'Transportation', color: '#5E5CE6', icon: 'car' },
  { id: 'entertainment', name: 'Entertainment', color: '#FF6B6B', icon: 'film' },
  { id: 'shopping', name: 'Shopping', color: '#FFCC5C', icon: 'cart' },
  { id: 'utilities', name: 'Utilities', color: '#4DACF7', icon: 'flash' },
  { id: 'health', name: 'Health', color: '#FF9FB1', icon: 'medical' },
  { id: 'education', name: 'Education', color: '#A78BFA', icon: 'school' },
  { id: 'other', name: 'Other', color: '#9CA3AF', icon: 'ellipsis-horizontal' }
];

export default {
  DATABASE_NAME,
  CREATE_CATEGORIES_TABLE,
  CREATE_EXPENSES_TABLE,
  CREATE_RECURRING_TRANSACTIONS_TABLE,
  DEFAULT_CATEGORIES
};