import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useTransactions } from '../contexts/TransactionsContext';
import { useRecurringTransactions } from '../contexts/RecurringTransactionsContext';
import Summary from '../components/Summary';
import TransactionItem from '../components/TransactionItem';
import type { Transaction } from '../database/schema';
import IncomeSection from '../components/IncomeSection';

const HomeScreen = () => {
  const router = useRouter();
  const {
    currentPeriodTransactions,
    monthlyTotal,
    isLoading,
    refreshData
  } = useTransactions();

  const { processTransactions } = useRecurringTransactions();
  const [refreshing, setRefreshing] = React.useState(false);

  // Process recurring transactions when the app starts
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    const processRecurring = async () => {
      try {
        await processTransactions();
      } catch (error) {
        console.error('Failed to process recurring transactions:', error);
      }
    };

    processRecurring();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Process any due recurring transactions
      await processTransactions();
      // Then refresh all transaction data
      await refreshData();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData, processTransactions]);

  const handleTransactionPress = (transaction: Transaction) => {
    router.push({
      pathname: "/transaction/[id]",
      params: { id: transaction.id }
    });
  };

  const handleViewAllTransactions = () => {
    router.push({ pathname: "/transactions" });
  };

  const handleOpenSettings = () => {
    router.push({ pathname: "/settings" });
  };

  // Get the most recent 5 transactions, sorted by date
  const recentTransactions = [...currentPeriodTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

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
        <Summary 
          spent={monthlyTotal.expenses} 
          income={monthlyTotal.incomes}
          net={monthlyTotal.net}
        />
        <IncomeSection />

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={handleViewAllTransactions}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsContainer}>
          {isLoading ? (
            <Text style={styles.emptyText}>Loading transactions...</Text>
          ) : recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet. Tap the "+" button to add one.</Text>
          ) : (
            recentTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={handleTransactionPress}
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
  transactionsContainer: {
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