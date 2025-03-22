import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useExpenses } from '../contexts/ExpensesContext';
import { useExpensesFilters } from '../hooks/useExpenses';
import ExpenseItem from '../components/ExpenseItem';
import type { Expense } from '../database/schema';

const ExpenseListScreen = () => {
  const router = useRouter();
  const { expenses, isLoading, refreshData } = useExpenses();
  const {
    filteredExpenses,
    isFiltering,
    activeFilter,
    clearFilters,
    getSelectedCategoryName
  } = useExpensesFilters();

  const [refreshing, setRefreshing] = useState(false);

  const displayedExpenses = activeFilter ? filteredExpenses : expenses;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleExpensePress = (expense: Expense) => {
    router.push({
      pathname: "/expense/[id]" as never,
      params: { id: expense.id }
    });
  };

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/add-expense');
  };

  const handleClearFilters = () => {
    Haptics.selectionAsync();
    clearFilters();
  };

  const renderFilterBanner = () => {
    if (!activeFilter) return null;

    let filterDescription = '';

    if (activeFilter === 'category') {
      filterDescription = `Category: ${getSelectedCategoryName()}`;
    } else if (activeFilter === 'date') {
      filterDescription = 'Custom Date Range';
    }

    return (
      <View style={styles.filterBanner}>
        <Text style={styles.filterText}>Filtered by: {filterDescription}</Text>
        <TouchableOpacity onPress={handleClearFilters}>
          <Text style={styles.clearFilterText}>Clear</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyList = () => {
    if (isLoading || isFiltering) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading expenses...</Text>
        </View>
      );
    }

    if (activeFilter) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No expenses found with the selected filter.</Text>
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No expenses yet. Tap the "+" button to add one.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'All Expenses',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      {renderFilterBanner()}

      <FlatList
        data={displayedExpenses}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onPress={handleExpensePress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#50E3C2"
            colors={["#50E3C2"]}
          />
        }
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  clearFilterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFilterButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(94, 92, 230, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    color: '#ffffff',
    fontSize: 14,
  },
  clearFilterText: {
    color: '#5E5CE6',
    fontWeight: '600',
    fontSize: 14,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#50E3C2',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#50E3C2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default ExpenseListScreen;