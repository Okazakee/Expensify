export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  isIncome: boolean; // Added this field
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

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    isIncome INTEGER NOT NULL DEFAULT 0,
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

// Add additional categories for income
export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 'food', name: 'Food', color: '#50E3C2', icon: 'fast-food' },
  { id: 'transport', name: 'Transportation', color: '#5E5CE6', icon: 'car' },
  { id: 'entertainment', name: 'Entertainment', color: '#FF6B6B', icon: 'film' },
  { id: 'shopping', name: 'Shopping', color: '#FFCC5C', icon: 'cart' },
  { id: 'utilities', name: 'Utilities', color: '#4DACF7', icon: 'flash' },
  { id: 'health', name: 'Health', color: '#FF9FB1', icon: 'medical' },
  { id: 'education', name: 'Education', color: '#A78BFA', icon: 'school' },
  { id: 'other', name: 'Other', color: '#9CA3AF', icon: 'ellipsis-horizontal' },

  // Income categories
  { id: 'salary', name: 'Salary', color: '#4CAF50', icon: 'cash' },
  { id: 'freelance', name: 'Freelance', color: '#8BC34A', icon: 'briefcase' },
  { id: 'investment', name: 'Investment', color: '#CDDC39', icon: 'trending-up' },
  { id: 'gift', name: 'Gift', color: '#FFC107', icon: 'gift' },
  { id: 'refund', name: 'Refund', color: '#FF9800', icon: 'return-down-back' },
  { id: 'other_income', name: 'Other Income', color: '#9CCC65', icon: 'add-circle' }
];

export default {
  DATABASE_NAME,
  CREATE_CATEGORIES_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_RECURRING_TRANSACTIONS_TABLE,
  DEFAULT_CATEGORIES
};