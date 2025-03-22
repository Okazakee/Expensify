import * as SQLite from 'expo-sqlite';
import {
  DATABASE_NAME,
  CREATE_CATEGORIES_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_RECURRING_TRANSACTIONS_TABLE,
  DEFAULT_CATEGORIES,
  type Category,
  type Transaction,
  type RecurringTransaction
} from './schema';

const db = SQLite.openDatabaseSync(DATABASE_NAME);

interface RecurringTransactionDB {
  id: string;
  amount: number;
  isIncome: number;
  note: string;
  category: string;
  recurrenceType: 'weekly' | 'monthly' | 'yearly';
  day: number | null;
  month: number | null;
  weekday: number | null;
  lastProcessed: string | null;
  nextDue: string | null;
  active: number;
}

const convertRecurringTransaction = (tx: RecurringTransactionDB): RecurringTransaction => ({
  id: tx.id,
  amount: tx.amount,
  isIncome: Boolean(tx.isIncome),
  note: tx.note,
  category: tx.category,
  recurrenceType: tx.recurrenceType,
  day: tx.day ?? undefined,
  month: tx.month ?? undefined,
  weekday: tx.weekday ?? undefined,
  lastProcessed: tx.lastProcessed ?? undefined,
  nextDue: tx.nextDue ?? undefined,
  active: Boolean(tx.active)
});

// Migration helper to add isIncome column to existing expenses table if needed
const migrateDatabase = async (): Promise<void> => {
  try {
    // Check if the transactions table exists
    const tableInfo = await db.getFirstAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'"
    );

    if (!tableInfo) {
      // If transactions table doesn't exist, we need to rename expenses to transactions
      // and add the isIncome field
      await db.execAsync(`
        -- Rename expenses table to transactions
        ALTER TABLE IF EXISTS expenses RENAME TO transactions;

        -- Add isIncome column if it doesn't exist
        ALTER TABLE transactions ADD COLUMN isIncome INTEGER NOT NULL DEFAULT 0;
      `);
      console.log('Migrated expenses table to transactions table with isIncome field');
    }
  } catch (error) {
    console.error('Error during migration:', error);
    // Continue with initialization even if migration fails
  }
};

export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      ${CREATE_CATEGORIES_TABLE}
      ${CREATE_TRANSACTIONS_TABLE}
      ${CREATE_RECURRING_TRANSACTIONS_TABLE}
    `);

    // Migrate existing data if needed
    await migrateDatabase();

    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM categories'
    );

    if (result?.count === 0) {
      await db.withTransactionAsync(async () => {
        for (const category of DEFAULT_CATEGORIES) {
          await db.runAsync(
            'INSERT INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)',
            [category.id, category.name, category.color, category.icon]
          );
        }
      });
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Category operations
export const getCategories = async (): Promise<Category[]> => {
  try {
    return await db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name');
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Transaction operations (renamed from Expense operations)
export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
  const id = Date.now().toString();
  try {
    await db.runAsync(
      'INSERT INTO transactions (id, amount, category, date, note, isIncome) VALUES (?, ?, ?, ?, ?, ?)',
      [id, transaction.amount, transaction.category, transaction.date, transaction.note, transaction.isIncome ? 1 : 0]
    );
    return id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const transactions = await db.getAllAsync<any>('SELECT * FROM transactions ORDER BY date DESC');
    return transactions.map(tx => ({
      ...tx,
      isIncome: Boolean(tx.isIncome)
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const getTransactionsByCategory = async (categoryId: string): Promise<Transaction[]> => {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const transactions = await db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE category = ? ORDER BY date DESC',
      [categoryId]
    );
    return transactions.map(tx => ({
      ...tx,
      isIncome: Boolean(tx.isIncome)
    }));
  } catch (error) {
    console.error('Error fetching transactions by category:', error);
    throw error;
  }
};

export const getTransactionsByDateRange = async (startDate: string, endDate: string): Promise<Transaction[]> => {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const transactions = await db.getAllAsync<any>(
      'SELECT * FROM transactions WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );
    return transactions.map(tx => ({
      ...tx,
      isIncome: Boolean(tx.isIncome)
    }));
  } catch (error) {
    console.error('Error fetching transactions by date range:', error);
    throw error;
  }
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    await db.runAsync(
      'UPDATE transactions SET amount = ?, category = ?, date = ?, note = ?, isIncome = ? WHERE id = ?',
      [transaction.amount, transaction.category, transaction.date, transaction.note, transaction.isIncome ? 1 : 0, transaction.id]
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

// Analytics queries
export const getTotalByCategory = async (startDate?: string, endDate?: string, transactionType?: 'income' | 'expense'): Promise<{categoryId: string, total: number}[]> => {
  try {
    let query = `
      SELECT category AS categoryId, SUM(amount) AS total
      FROM transactions
      WHERE 1=1`;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const params: any[] = [];

    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    if (transactionType === 'income') {
      query += " AND isIncome = 1";
    } else if (transactionType === 'expense') {
      query += " AND isIncome = 0";
    }

    query += " GROUP BY category";

    return await db.getAllAsync<{categoryId: string, total: number}>(query, params);
  } catch (error) {
    console.error('Error fetching total by category:', error);
    throw error;
  }
};

export const getMonthlyTransactions = async (year: number, transactionType?: 'income' | 'expense'): Promise<{month: number, total: number}[]> => {
  try {
    let query = `
      SELECT CAST(strftime('%m', date) AS INTEGER) AS month,
             SUM(amount) AS total
      FROM transactions
      WHERE strftime('%Y', date) = ?`;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const params: any[] = [year.toString()];

    if (transactionType === 'income') {
      query += " AND isIncome = 1";
    } else if (transactionType === 'expense') {
      query += " AND isIncome = 0";
    }

    query += " GROUP BY month ORDER BY month";

    return await db.getAllAsync<{month: number, total: number}>(query, params);
  } catch (error) {
    console.error('Error fetching monthly transactions:', error);
    throw error;
  }
};

export const getIncomeSummary = async (startDate?: string, endDate?: string): Promise<number> => {
  try {
    let query = "SELECT SUM(amount) as total FROM transactions WHERE isIncome = 1";
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const params: any[] = [];

    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const result = await db.getFirstAsync<{total: number}>(query, params);
    return result?.total || 0;
  } catch (error) {
    console.error('Error fetching income summary:', error);
    throw error;
  }
};

export const getExpenseSummary = async (startDate?: string, endDate?: string): Promise<number> => {
  try {
    let query = "SELECT SUM(amount) as total FROM transactions WHERE isIncome = 0";
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const params: any[] = [];

    if (startDate && endDate) {
      query += " AND date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const result = await db.getFirstAsync<{total: number}>(query, params);
    return result?.total || 0;
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    throw error;
  }
};

export const getNetIncome = async (startDate?: string, endDate?: string): Promise<number> => {
  try {
    let query = `
      SELECT
        COALESCE(SUM(CASE WHEN isIncome = 1 THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN isIncome = 0 THEN amount ELSE 0 END), 0) as netIncome
      FROM transactions
    `;

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const params: any[] = [];

    if (startDate && endDate) {
      query += " WHERE date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    }

    const result = await db.getFirstAsync<{netIncome: number}>(query, params);
    return result?.netIncome || 0;
  } catch (error) {
    console.error('Error calculating net income:', error);
    throw error;
  }
};

// Recurring Transactions
export const calculateNextDueDate = (
  transaction: Pick<RecurringTransaction, 'recurrenceType'> & Partial<RecurringTransaction>
): string => {
  const today = new Date();
  const nextDue = new Date();

  if (transaction.recurrenceType === 'monthly') {
    nextDue.setDate(transaction.day || 1);
    if (nextDue < today) nextDue.setMonth(nextDue.getMonth() + 1);
  } else if (transaction.recurrenceType === 'yearly') {
    nextDue.setMonth((transaction.month || 1) - 1);
    nextDue.setDate(transaction.day || 1);
    if (nextDue < today) nextDue.setFullYear(nextDue.getFullYear() + 1);
  } else if (transaction.recurrenceType === 'weekly') {
    const currentDay = today.getDay();
    const targetDay = transaction.weekday || 0;
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    nextDue.setDate(today.getDate() + daysToAdd);
  }

  return nextDue.toISOString().split('T')[0];
};

export const addRecurringTransaction = async (
  transaction: Omit<RecurringTransaction, 'id' | 'lastProcessed' | 'nextDue'>
): Promise<string> => {
  const id = Date.now().toString();
  const nextDue = calculateNextDueDate(transaction);

  try {
    await db.runAsync(
      `INSERT INTO recurring_transactions
       (id, amount, isIncome, note, category, recurrenceType, day, month, weekday, lastProcessed, nextDue, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        transaction.amount,
        transaction.isIncome ? 1 : 0,
        transaction.note,
        transaction.category,
        transaction.recurrenceType,
        transaction.day ?? null,
        transaction.month ?? null,
        transaction.weekday ?? null,
        null,
        nextDue,
        transaction.active ? 1 : 0
      ]
    );
    return id;
  } catch (error) {
    console.error('Error adding recurring transaction:', error);
    throw error;
  }
};

export const getRecurringTransactions = async (): Promise<RecurringTransaction[]> => {
  try {
    const transactions = await db.getAllAsync<RecurringTransactionDB>(
      'SELECT * FROM recurring_transactions ORDER BY nextDue ASC'
    );
    return transactions.map(convertRecurringTransaction);
  } catch (error) {
    console.error('Error fetching recurring transactions:', error);
    throw error;
  }
};

export const getRecurringTransactionById = async (id: string): Promise<RecurringTransaction | null> => {
  try {
    const transaction = await db.getFirstAsync<RecurringTransactionDB>(
      'SELECT * FROM recurring_transactions WHERE id = ?',
      [id]
    );
    return transaction ? convertRecurringTransaction(transaction) : null;
  } catch (error) {
    console.error('Error fetching recurring transaction:', error);
    throw error;
  }
};

export const updateRecurringTransaction = async (transaction: RecurringTransaction): Promise<void> => {
  const nextDue = transaction.nextDue ?? calculateNextDueDate(transaction);

  try {
    await db.runAsync(
      `UPDATE recurring_transactions
       SET amount = ?, isIncome = ?, note = ?, category = ?,
           recurrenceType = ?, day = ?, month = ?, weekday = ?,
           lastProcessed = ?, nextDue = ?, active = ?
       WHERE id = ?`,
      [
        transaction.amount,
        transaction.isIncome ? 1 : 0,
        transaction.note,
        transaction.category,
        transaction.recurrenceType,
        transaction.day ?? null,
        transaction.month ?? null,
        transaction.weekday ?? null,
        transaction.lastProcessed ?? null,
        nextDue,
        transaction.active ? 1 : 0,
        transaction.id
      ]
    );
  } catch (error) {
    console.error('Error updating recurring transaction:', error);
    throw error;
  }
};

export const deleteRecurringTransaction = async (id: string): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM recurring_transactions WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting recurring transaction:', error);
    throw error;
  }
};

export const processRecurringTransactions = async (): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dueTransactions = await db.getAllAsync<RecurringTransactionDB>(
      `SELECT * FROM recurring_transactions
       WHERE active = 1 AND nextDue <= ?
       ORDER BY nextDue ASC`,
      [today]
    );

    if (dueTransactions.length === 0) return;

    await db.withTransactionAsync(async () => {
      for (const dbTx of dueTransactions) {
        const tx = convertRecurringTransaction(dbTx);

        // Add the transaction (now handling both income and expenses)
        await addTransaction({
          amount: tx.amount,
          category: tx.category,
          date: today,
          note: `[Auto] ${tx.note}`,
          isIncome: tx.isIncome
        });

        await updateRecurringTransaction({
          ...tx,
          lastProcessed: today,
          nextDue: calculateNextDueDate(tx)
        });
      }
    });
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
    throw error;
  }
};

export default {
  initDatabase,
  getCategories,
  addTransaction,
  getTransactions,
  getTransactionsByCategory,
  getTransactionsByDateRange,
  updateTransaction,
  deleteTransaction,
  getTotalByCategory,
  getMonthlyTransactions,
  getIncomeSummary,
  getExpenseSummary,
  getNetIncome,
  addRecurringTransaction,
  getRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions
};