import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { formatCurrency } from '../utils/currencyUtils';
import TransactionEditor from '../components/TransactionEditor';

// Define transaction type
interface RecurringTransaction {
  id: string;
  amount: number;
  note: string;
  isIncome: boolean;
  recurrenceType: 'monthly' | 'yearly' | 'weekly';
  day?: number;
  month?: number;
  weekday?: number;
}

// Temporary mock data for recurring transactions
const MOCK_TRANSACTIONS: RecurringTransaction[] = [
  { id: '1', amount: 1200, note: 'Salary', isIncome: true, recurrenceType: 'monthly', day: 1 },
  { id: '2', amount: 500, note: 'Rent', isIncome: false, recurrenceType: 'monthly', day: 15 },
  { id: '3', amount: 3000, note: 'Bonus', isIncome: true, recurrenceType: 'yearly', month: 12, day: 15 },
  { id: '4', amount: 200, note: 'Insurance', isIncome: false, recurrenceType: 'weekly', weekday: 1 },
];

const TransactionsScreen = () => {
  const router = useRouter();
  const [transactions] = useState<RecurringTransaction[]>(MOCK_TRANSACTIONS);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [isAddingIncome, setIsAddingIncome] = useState<boolean>(true);
  const [selectedTransaction, setSelectedTransaction] = useState<RecurringTransaction | null>(null);

  const handleAddIncome = () => {
    setSelectedTransaction(null);
    setIsAddingIncome(true);
    setShowEditor(true);
  };

  const handleAddExpense = () => {
    setSelectedTransaction(null);
    setIsAddingIncome(false);
    setShowEditor(true);
  };

  const handleEditTransaction = (transaction: RecurringTransaction) => {
    setSelectedTransaction(transaction);
    setIsAddingIncome(transaction.isIncome);
    setShowEditor(true);
  };

  const handleDeleteTransaction = (id: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this recurring transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // In a real app, would call a function to delete the transaction
            console.log('Deleting transaction', id);
          }
        }
      ]
    );
  };

  const renderTransactionItem = ({ item }: { item: RecurringTransaction }) => {
    const iconName = item.isIncome ? 'arrow-down-circle' : 'arrow-up-circle';
    const iconColor = item.isIncome ? '#15E8FE' : '#FF6B6B';
    const amountPrefix = item.isIncome ? '+ ' : '- ';
    const amountColor = item.isIncome ? '#15E8FE' : '#FF6B6B';

    // Get recurrence text with details
    let recurrenceText = '';
    if (item.recurrenceType === 'monthly') {
      recurrenceText = `Monthly (Day ${item.day})`;
    } else if (item.recurrenceType === 'yearly') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = item.month && item.month >= 1 && item.month <= 12 ? monthNames[item.month - 1] : '';
      recurrenceText = `Yearly (${monthName} ${item.day})`;
    } else if (item.recurrenceType === 'weekly') {
      const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weekdayName = item.weekday && item.weekday >= 1 && item.weekday <= 7 ? weekdayNames[item.weekday - 1] : '';
      recurrenceText = `Weekly (${weekdayName})`;
    }

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => handleEditTransaction(item)}
      >
        <View style={styles.transactionIconContainer}>
          {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
          <Ionicons name={iconName as any} size={24} color={iconColor} />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionNote}>{item.note}</Text>
          <Text style={styles.transactionRecurrence}>{recurrenceText}</Text>
        </View>

        <View style={styles.transactionAmount}>
          <Text style={[styles.transactionAmountText, { color: amountColor }]}>
            {amountPrefix}{formatCurrency(item.amount)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteTransaction(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setSelectedTransaction(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Recurring Transactions',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Manage Recurring Transactions</Text>
        <Text style={styles.headerSubtitle}>Set up and manage your periodic income and expenses</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.incomeButton]}
            onPress={handleAddIncome}
          >
            <Ionicons name="add-circle" size={18} color="#15E8FE" style={styles.actionButtonIcon} />
            <Text style={styles.incomeButtonText}>Add Income</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.expenseButton]}
            onPress={handleAddExpense}
          >
            <Ionicons name="add-circle" size={18} color="#FF6B6B" style={styles.actionButtonIcon} />
            <Text style={styles.expenseButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionListContainer}>
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recurring transactions yet.</Text>
              <Text style={styles.emptySubText}>Add your recurring incomes and expenses to better track your finances.</Text>
            </View>
          )}
        </View>
      </View>

      <TransactionEditor
        isVisible={showEditor}
        onClose={handleEditorClose}
        isIncome={isAddingIncome}
        initialTransaction={selectedTransaction}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  incomeButton: {
    marginRight: 8,
    backgroundColor: 'rgba(21, 232, 254, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(21, 232, 254, 0.3)',
  },
  expenseButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  incomeButtonText: {
    color: '#15E8FE',
    fontWeight: '600',
  },
  expenseButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  transactionListContainer: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionIconContainer: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionNote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionRecurrence: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  transactionAmount: {
    marginRight: 12,
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default TransactionsScreen;