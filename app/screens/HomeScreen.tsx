import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { useExpenses } from '../contexts/ExpensesContext';
import Summary from '../components/Summary';
import ExpenseItem from '../components/ExpenseItem';
import type { Expense } from '../database/schema';

const HomeScreen = () => {
  const router = useRouter();
  const {
    currentMonthExpenses,
    monthlyTotal,
    isLoading,
    refreshData
  } = useExpenses();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const handleExpensePress = (expense: Expense) => {
    router.push({
      pathname: "/(expenses)/[id]" as never,
      params: { id: expense.id }
    });
};

  const handleAddExpense = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: "/add-expense" });
  };

  const handleViewReports = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/reports" });
  };

  const handleViewAllExpenses = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/expenses" });
  };

  const handleOpenSettings = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/settings" });
  };

  // Only show the most recent 5 expenses
  const recentExpenses = currentMonthExpenses.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Expensify</Text>
        <TouchableOpacity onPress={handleOpenSettings}>
          <Ionicons name="settings-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#50E3C2"
            colors={["#50E3C2"]}
          />
        }
      >
        {/* Budget Summary */}
        <Summary spent={monthlyTotal} />

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddExpense}>
            <BlurView intensity={20} style={styles.actionButtonInner} tint="dark">
              <Ionicons name="add-circle" size={24} color="#50E3C2" />
              <Text style={styles.actionText}>Add Expense</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleViewReports}>
            <BlurView intensity={20} style={styles.actionButtonInner} tint="dark">
              <Ionicons name="pie-chart" size={24} color="#5E5CE6" />
              <Text style={styles.actionText}>Reports</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Recent Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={handleViewAllExpenses}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.expensesContainer}>
          {isLoading ? (
            <Text style={styles.emptyText}>Loading expenses...</Text>
          ) : recentExpenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses yet. Tap the "+" button to add one.</Text>
          ) : (
            recentExpenses.map(expense => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onPress={handleExpensePress}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddExpense}
      >
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  actionText: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#50E3C2',
  },
  expensesContainer: {
    marginBottom: 80,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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

export default HomeScreen;