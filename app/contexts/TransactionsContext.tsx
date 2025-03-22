import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  initDatabase,
  getCategories,
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByDateRange,
  getTotalByCategory,
  getMonthlyTransactions,
  getIncomeSummary,
  getExpenseSummary,
  getNetIncome
} from '../database/database';
import type { Transaction, Category } from '../database/schema';
import { getCurrentYear } from '../utils/dateUtils';
import { usePeriod } from './PeriodContext';

interface TransactionsContextType {
  transactions: Transaction[];
  expenses: Transaction[];
  incomes: Transaction[];
  categories: Category[];
  isLoading: boolean;
  monthlyTotal: {
    expenses: number;
    incomes: number;
    net: number;
  };
  currentPeriodTransactions: Transaction[];
  categoryTotals: {
    expenses: {categoryId: string, total: number}[];
    incomes: {categoryId: string, total: number}[];
  };
  monthlyData: {
    expenses: {month: number, total: number}[];
    incomes: {month: number, total: number}[];
  };
  // Actions
  addNewTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<string>;
  updateExistingTransaction: (transaction: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const TransactionsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { startDate, endDate } = usePeriod();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPeriodTransactions, setCurrentPeriodTransactions] = useState<Transaction[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState({
    expenses: 0,
    incomes: 0,
    net: 0
  });
  const [categoryTotals, setCategoryTotals] = useState({
    expenses: [] as {categoryId: string, total: number}[],
    incomes: [] as {categoryId: string, total: number}[]
  });
  const [monthlyData, setMonthlyData] = useState({
    expenses: [] as {month: number, total: number}[],
    incomes: [] as {month: number, total: number}[]
  });

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
  }, [startDate, endDate, isLoading]);

  const loadAllData = async () => {
    try {
      setIsLoading(true);

      // Get all categories and transactions
      const allCategories = await getCategories();
      const allTransactions = await getTransactions();

      // Separate expenses and incomes
      const allExpenses = allTransactions.filter(tx => !tx.isIncome);
      const allIncomes = allTransactions.filter(tx => tx.isIncome);

      setCategories(allCategories);
      setTransactions(allTransactions);
      setExpenses(allExpenses);
      setIncomes(allIncomes);

      // Get monthly data for current year (for charts)
      const currentYear = getCurrentYear();
      const monthlyExpenses = await getMonthlyTransactions(currentYear, 'expense');
      const monthlyIncomes = await getMonthlyTransactions(currentYear, 'income');

      setMonthlyData({
        expenses: monthlyExpenses,
        incomes: monthlyIncomes
      });

      // Load period-specific data
      await loadPeriodData();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load transaction data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPeriodData = async () => {
    try {
      const periodTransactions = await getTransactionsByDateRange(startDate, endDate);
      const sortedTransactions = [...periodTransactions].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setCurrentPeriodTransactions(sortedTransactions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading period data:', error);
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

  const addNewTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const id = await addTransaction(transaction);
      await refreshData();
      return id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
      throw error;
    }
  };

  const updateExistingTransaction = async (transaction: Transaction) => {
    try {
      await updateTransaction(transaction);
      await refreshData();
    } catch (error) {
      console.error('Error updating transaction:', error);
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
      throw error;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      await refreshData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', 'Failed to delete transaction. Please try again.');
      throw error;
    }
  };

  const value = {
    transactions,
    expenses,
    incomes,
    categories,
    isLoading,
    monthlyTotal,
    currentPeriodTransactions,
    categoryTotals,
    monthlyData,
    addNewTransaction,
    updateExistingTransaction,
    removeTransaction,
    refreshData
  };

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};

export default TransactionsContext;