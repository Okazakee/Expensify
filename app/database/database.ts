import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME, CREATE_CATEGORIES_TABLE, CREATE_EXPENSES_TABLE, DEFAULT_CATEGORIES, type Category, type Expense } from './schema';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async (): Promise<void> => {
  db = SQLite.openDatabase(DATABASE_NAME);

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create tables
        tx.executeSql(CREATE_CATEGORIES_TABLE);
        tx.executeSql(CREATE_EXPENSES_TABLE);

        // Check if categories exist
        tx.executeSql(
          'SELECT * FROM categories',
          [],
          (_, result) => {
            if (result.rows.length === 0) {
              // Insert default categories
              DEFAULT_CATEGORIES.forEach(category => {
                tx.executeSql(
                  'INSERT INTO categories (id, name, color, icon) VALUES (?, ?, ?, ?)',
                  [category.id, category.name, category.color, category.icon]
                );
              });
            }
          }
        );
      },
      error => {
        console.error('Error initializing database:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

// Category operations
export const getCategories = (): Promise<Category[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM categories ORDER BY name',
        [],
        (_, result) => {
          const categories: Category[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            categories.push(result.rows.item(i) as Category);
          }
          resolve(categories);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Expense operations
export const addExpense = (expense: Omit<Expense, 'id'>): Promise<string> => {
  const id = Date.now().toString();

  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO expenses (id, amount, category, date, note) VALUES (?, ?, ?, ?, ?)',
        [id, expense.amount, expense.category, expense.date, expense.note],
        () => {
          resolve(id);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getExpenses = (): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses ORDER BY date DESC',
        [],
        (_, result) => {
          const expenses: Expense[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            expenses.push(result.rows.item(i) as Expense);
          }
          resolve(expenses);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getExpensesByCategory = (categoryId: string): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC',
        [categoryId],
        (_, result) => {
          const expenses: Expense[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            expenses.push(result.rows.item(i) as Expense);
          }
          resolve(expenses);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getExpensesByDateRange = (startDate: string, endDate: string): Promise<Expense[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC',
        [startDate, endDate],
        (_, result) => {
          const expenses: Expense[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            expenses.push(result.rows.item(i) as Expense);
          }
          resolve(expenses);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const updateExpense = (expense: Expense): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE expenses SET amount = ?, category = ?, date = ?, note = ? WHERE id = ?',
        [expense.amount, expense.category, expense.date, expense.note, expense.id],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const deleteExpense = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM expenses WHERE id = ?',
        [id],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

// Analytics queries
export const getTotalExpensesByCategory = (): Promise<{categoryId: string, total: number}[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT category as categoryId, SUM(amount) as total FROM expenses GROUP BY category',
        [],
        (_, result) => {
          const totals: {categoryId: string, total: number}[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            totals.push(result.rows.item(i) as {categoryId: string, total: number});
          }
          resolve(totals);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const getMonthlyExpenses = (year: number): Promise<{month: number, total: number}[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT
          CAST(strftime('%m', date) AS INTEGER) as month,
          SUM(amount) as total
         FROM expenses
         WHERE strftime('%Y', date) = ?
         GROUP BY month
         ORDER BY month`,
        [year.toString()],
        (_, result) => {
          const monthlyTotals: {month: number, total: number}[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            monthlyTotals.push(result.rows.item(i) as {month: number, total: number});
          }
          resolve(monthlyTotals);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};