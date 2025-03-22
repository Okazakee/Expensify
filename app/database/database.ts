import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, CREATE_CATEGORIES_TABLE, CREATE_EXPENSES_TABLE, DEFAULT_CATEGORIES, type Category, type Expense } from './schema';

const db = SQLite.openDatabaseSync(DATABASE_NAME);

export const initDatabase = async (): Promise<void> => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      ${CREATE_CATEGORIES_TABLE}
      ${CREATE_EXPENSES_TABLE}
    `);

    // Check if categories exist
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
export const getTotalExpensesByCategory = async (): Promise<{categoryId: string, total: number}[]> => {
  try {
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
      `SELECT
        CAST(strftime('%m', date) AS INTEGER) AS month,
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

// Default export for compatibility with Expo Router
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
  getMonthlyExpenses
};