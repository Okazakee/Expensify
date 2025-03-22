import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';


import { useExpenses } from '../contexts/ExpensesContext';
import Summary from '../components/Summary';
import ExpenseItem from '../components/ExpenseItem';
import type { Expense } from '../database/schema';
import IncomeSection from '../components/IncomeSection';

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
      pathname: "/expense/[id]",
      params: { id: expense.id }
    });
};

  const handleViewAllExpenses = () => {
    Haptics.selectionAsync();
    router.push({ pathname: "/expenses" });
  };

  const handleOpenSettings = () => {
    router.push({ pathname: "/settings" });
  };

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
            tintColor="#15E8FE"
            colors={["#15E8FE"]}
          />
        }
      >
        {/* Budget Summary */}
        <Summary spent={monthlyTotal} />
        <IncomeSection
          onIncomePress={() => console.log('asd')}
          onExpensePress={() => console.log('asd')}
        />

        {/* Monthly Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Monthly Expenses</Text>
          <TouchableOpacity onPress={handleViewAllExpenses}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.expensesContainer}>
          {isLoading ? (
            <Text style={styles.emptyText}>Loading expenses...</Text>
          ) : currentMonthExpenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses yet. Tap the "+" button to add one.</Text>
          ) : (
            currentMonthExpenses.map(expense => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onPress={handleExpensePress}
              />
            ))
          )}
        </View>
      </ScrollView>

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
    color: '#15E8FE',
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
});

export default HomeScreen;