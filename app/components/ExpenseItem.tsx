import type React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import type { Expense } from '../database/schema';
import { useExpenses } from '../contexts/ExpensesContext';

interface ExpenseItemProps {
  expense: Expense;
  onPress?: (expense: Expense) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onPress }) => {
  const { categories } = useExpenses();

  const category = categories.find(c => c.id === expense.category);

  const handlePress = () => {
    if (onPress) {
      onPress(expense);
    }
  };

  if (!category) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
        {/* TODO fix type later */}
        {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
        <Ionicons name={category.icon as any} size={18} color="#000000" />
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.note}>{expense.note || 'No description'}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <Text style={styles.date}>{formatDate(expense.date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  note: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default ExpenseItem;