import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  getRecurringTransactions,
  addRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions
} from '../database/database';
import type { RecurringTransaction } from '../database/schema';

interface RecurringTransactionsContextType {
  transactions: RecurringTransaction[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<RecurringTransaction, 'id' | 'lastProcessed' | 'nextDue'>) => Promise<string>;
  updateTransaction: (transaction: RecurringTransaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  processTransactions: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const RecurringTransactionsContext = createContext<RecurringTransactionsContextType | undefined>(undefined);

export const RecurringTransactionsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([]);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        await refreshTransactions();
      } catch (error) {
        console.error('Failed to load recurring transactions:', error);
      }
    };

    loadTransactions();
  }, []);

  const refreshTransactions = async () => {
    try {
      setIsLoading(true);
      const allTransactions = await getRecurringTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      Alert.alert('Error', 'Failed to refresh recurring transactions.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<RecurringTransaction, 'id' | 'lastProcessed' | 'nextDue'>) => {
    try {
      const id = await addRecurringTransaction(transaction);
      await refreshTransactions();
      return id;
    } catch (error) {
      console.error('Error adding recurring transaction:', error);
      Alert.alert('Error', 'Failed to add recurring transaction.');
      throw error;
    }
  };

  const updateTransaction = async (transaction: RecurringTransaction) => {
    try {
      await updateRecurringTransaction(transaction);
      await refreshTransactions();
    } catch (error) {
      console.error('Error updating recurring transaction:', error);
      Alert.alert('Error', 'Failed to update recurring transaction.');
      throw error;
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      await deleteRecurringTransaction(id);
      await refreshTransactions();
    } catch (error) {
      console.error('Error deleting recurring transaction:', error);
      Alert.alert('Error', 'Failed to delete recurring transaction.');
      throw error;
    }
  };

  const processTransactions = async () => {
    try {
      await processRecurringTransactions();
      await refreshTransactions();
    } catch (error) {
      console.error('Error processing recurring transactions:', error);
      Alert.alert('Error', 'Failed to process recurring transactions.');
      throw error;
    }
  };

  const value = {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    removeTransaction,
    processTransactions,
    refreshTransactions
  };

  return (
    <RecurringTransactionsContext.Provider value={value}>
      {children}
    </RecurringTransactionsContext.Provider>
  );
};

export const useRecurringTransactions = () => {
  const context = useContext(RecurringTransactionsContext);
  if (context === undefined) {
    throw new Error('useRecurringTransactions must be used within a RecurringTransactionsProvider');
  }
  return context;
};

export default RecurringTransactionsContext;