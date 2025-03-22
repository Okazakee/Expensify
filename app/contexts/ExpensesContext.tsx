import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  initDatabase,
  getCategories,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpensesByDateRange,
  getTotalExpensesByCategory,
  getMonthlyExpenses
} from '../database/database';
import type { Expense, Category } from '../database/schema';
import { getCurrentMonthRange, getCurrentYear } from '../utils/dateUtils';
import { usePeriod } from './PeriodContext';

interface ExpensesContextType {
  expenses: Expense[];
  categories: Category[];
  isLoading: boolean;
  monthlyTotal: number;
  currentMonthExpenses: Expense[];
  categoryTotals: {categoryId: string, total: number}[];
  monthlyExpenseData: {month: number, total: number}[];
  // Actions
  addNewExpense: (expense: Omit<Expense, 'id'>) => Promise<string>;
  updateExistingExpense: (expense: Expense) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(undefined);

export const ExpensesProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { startDate, endDate } = usePeriod();
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentMonthExpenses, setCurrentMonthExpenses] = useState<Expense[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<{categoryId: string, total: number}[]>([]);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<{month: number, total: number}[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        await loadAllData();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        Alert.alert('Error', 'Failed to initialize the app. Please restart.');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Load period-specific data when period changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (!isLoading) {
      loadPeriodData();
    }
  }, [startDate, endDate]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      // Get all categories and expenses (not filtered by period)
      const allCategories = await getCategories();
      const allExpenses = await getExpenses();
      setCategories(allCategories);
      setExpenses(allExpenses);

      // Get monthly expenses for current year (for charts)
      const currentYear = getCurrentYear();
      const monthlyData = await getMonthlyExpenses(currentYear);
      setMonthlyExpenseData(monthlyData);

      // Load period-specific data
      await loadPeriodData();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load expense data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPeriodData = async () => {
    try {
      setIsLoading(true);

      // Get period expenses using the current date range from PeriodContext
      const periodExpenses = await getExpensesByDateRange(startDate, endDate);

      // Sort expenses by date (newest first)
      const sortedExpenses = [...periodExpenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setCurrentMonthExpenses(sortedExpenses);

      // Calculate period total from the current period expenses
      const total = periodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      setMonthlyTotal(total);

      // Get category totals for this period - modify the function to accept date range
      const totals = await getTotalExpensesByCategory(startDate, endDate);
      setCategoryTotals(totals);
    } catch (error) {
      console.error('Error loading period data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      await loadAllData();
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  };

  const addNewExpense = async (expense: Omit<Expense, 'id'>) => {
    try {
      const id = await addExpense(expense);
      await refreshData();
      return id;
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense. Please try again.');
      throw error;
    }
  };

  const updateExistingExpense = async (expense: Expense) => {
    try {
      await updateExpense(expense);
      await refreshData();
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense. Please try again.');
      throw error;
    }
  };

  const removeExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      Alert.alert('Error', 'Failed to delete expense. Please try again.');
      throw error;
    }
  };

  const value = {
    expenses,
    categories,
    isLoading,
    monthlyTotal,
    currentMonthExpenses,
    categoryTotals,
    monthlyExpenseData,
    addNewExpense,
    updateExistingExpense,
    removeExpense,
    refreshData
  };

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpensesProvider');
  }
  return context;
};

export default ExpensesContext;