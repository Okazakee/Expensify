import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useExpenses } from '../contexts/ExpensesContext';
import type { Expense } from '../database/schema';
import { getExpensesByCategory, getExpensesByDateRange } from '../database/database';

export const useExpensesFilters = () => {
  const { categories } = useExpenses();
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'category' | 'date' | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  const filterByCategory = useCallback(async (categoryId: string) => {
    try {
      setIsFiltering(true);
      const expenses = await getExpensesByCategory(categoryId);
      setFilteredExpenses(expenses);
      setSelectedCategoryId(categoryId);
      setActiveFilter('category');
    } catch (error) {
      console.error('Error filtering by category:', error);
      Alert.alert('Error', 'Failed to filter expenses by category.');
    } finally {
      setIsFiltering(false);
    }
  }, []);

  const filterByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setIsFiltering(true);
      const expenses = await getExpensesByDateRange(startDate, endDate);
      setFilteredExpenses(expenses);
      setDateRange({ startDate, endDate });
      setActiveFilter('date');
    } catch (error) {
      console.error('Error filtering by date range:', error);
      Alert.alert('Error', 'Failed to filter expenses by date range.');
    } finally {
      setIsFiltering(false);
    }
  }, []);

  const clearFilters = useCallback(() => {
    setFilteredExpenses([]);
    setSelectedCategoryId(null);
    setDateRange(null);
    setActiveFilter(null);
    setIsFiltering(false);
  }, []);

  const getSelectedCategoryName = useCallback(() => {
    if (!selectedCategoryId) return '';
    const category = categories.find(c => c.id === selectedCategoryId);
    return category ? category.name : '';
  }, [selectedCategoryId, categories]);

  return {
    filteredExpenses,
    isFiltering,
    activeFilter,
    selectedCategoryId,
    dateRange,
    filterByCategory,
    filterByDateRange,
    clearFilters,
    getSelectedCategoryName
  };
};

export const useCategoryStats = (categoryId: string) => {
  const { expenses, categories } = useExpenses();

  const categoryExpenses = expenses.filter(expense => expense.category === categoryId);
  const category = categories.find(c => c.id === categoryId);

  const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const count = categoryExpenses.length;
  const averageAmount = count > 0 ? total / count : 0;

  return {
    category,
    total,
    count,
    averageAmount,
    expenses: categoryExpenses
  };
};

export default { useExpensesFilters, useCategoryStats };