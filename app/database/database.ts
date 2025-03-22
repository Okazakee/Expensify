import * as SQLite from 'expo-sqlite';
import { 
  DATABASE_NAME, 
  CREATE_CATEGORIES_TABLE, 
  CREATE_EXPENSES_TABLE, 
  CREATE_RECURRING_TRANSACTIONS_TABLE,
  DEFAULT_CATEGORIES, 
  type Category, 
  type Expense, 
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

export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      ${CREATE_CATEGORIES_TABLE}
      ${CREATE_EXPENSES_TABLE}
      ${CREATE_RECURRING_TRANSACTIONS_TABLE}
    `);

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

// Expense operations
export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
  const id = Date.now().toString();
  try {
    await db.runAsync(
      'INSERT INTO expenses (id, amount, category, date, note) VALUES (?, ?, ?, ?, ?)',
      [id, expense.amount, expense.category, expense.date, expense.note]
    );
    return id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

export const getExpenses = async (): Promise<Expense[]> => {
  try {
    return await db.getAllAsync<Expense>('SELECT * FROM expenses ORDER BY date DESC');
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

export const getExpensesByCategory = async (categoryId: string): Promise<Expense[]> => {
  try {
    return await db.getAllAsync<Expense>(
      'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC',
      [categoryId]
    );
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    throw error;
  }
};

export const getExpensesByDateRange = async (startDate: string, endDate: string): Promise<Expense[]> => {
  try {
    return await db.getAllAsync<Expense>(
      'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC',
      [startDate, endDate]
    );
  } catch (error) {
    console.error('Error fetching expenses by date range:', error);
    throw error;
  }
};

export const updateExpense = async (expense: Expense): Promise<void> => {
  try {
    await db.runAsync(
      'UPDATE expenses SET amount = ?, category = ?, date = ?, note = ? WHERE id = ?',
      [expense.amount, expense.category, expense.date, expense.note, expense.id]
    );
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

// Analytics queries
export const getTotalExpensesByCategory = async (startDate?: string, endDate?: string): Promise<{categoryId: string, total: number}[]> => {
  try {
    if (startDate && endDate) {
      return await db.getAllAsync<{categoryId: string, total: number}>(
        `SELECT category AS categoryId, SUM(amount) AS total 
         FROM expenses 
         WHERE date BETWEEN ? AND ? 
         GROUP BY category`,
        [startDate, endDate]
      );
    }
    return await db.getAllAsync<{categoryId: string, total: number}>(
      'SELECT category AS categoryId, SUM(amount) AS total FROM expenses GROUP BY category'
    );
  } catch (error) {
    console.error('Error fetching total expenses by category:', error);
    throw error;
  }
};

export const getMonthlyExpenses = async (year: number): Promise<{month: number, total: number}[]> => {
  try {
    return await db.getAllAsync<{month: number, total: number}>(
      `SELECT CAST(strftime('%m', date) AS INTEGER) AS month, 
              SUM(amount) AS total 
       FROM expenses 
       WHERE strftime('%Y', date) = ? 
       GROUP BY month 
       ORDER BY month`,
      [year.toString()]
    );
  } catch (error) {
    console.error('Error fetching monthly expenses:', error);
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

        if (!tx.isIncome) {
          await addExpense({
            amount: tx.amount,
            category: tx.category,
            date: today,
            note: `[Auto] ${tx.note}`
          });
        }

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
  addExpense,
  getExpenses,
  getExpensesByCategory,
  getExpensesByDateRange,
  updateExpense,
  deleteExpense,
  getTotalExpensesByCategory,
  getMonthlyExpenses,
  addRecurringTransaction,
  getRecurringTransactions,
  getRecurringTransactionById,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions
};