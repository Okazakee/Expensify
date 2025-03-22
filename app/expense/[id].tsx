import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


import { useExpenses } from '../contexts/ExpensesContext';
import { formatFullDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import type { Expense } from '../database/schema';

export default function ExpenseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { expenses, categories, removeExpense } = useExpenses();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [category, setCategory] = useState<any>(null);

  useEffect(() => {
    if (typeof id !== 'string') return;

    const foundExpense = expenses.find(e => e.id === id);
    if (foundExpense) {
      setExpense(foundExpense);
      const foundCategory = categories.find(c => c.id === foundExpense.category);
      setCategory(foundCategory);
    }
  }, [id, expenses, categories]);

  const handleEdit = () => {
    if (expense) {
      // Navigate to edit screen with the ID in the URL
      router.push(`/expense/edit/${expense.id}`);
    }
  };

  const handleDelete = () => {
    if (!expense) return;

    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeExpense(expense.id);
              router.back();
            } catch (error) {
              console.error('Failed to delete expense:', error);
            }
          }
        }
      ]
    );
  };

  if (!expense || !category) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Expense Details',
            headerStyle: {
              backgroundColor: '#1A1A1A',
            },
            headerTintColor: '#FFFFFF',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading expense details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Expense Details',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View
            style={[styles.categoryIcon, { backgroundColor: category.color }]}
          >
            <Ionicons name={category.icon} size={32} color="#000000" />
          </View>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatFullDate(expense.date)}</Text>
        </View>

        {expense.note ? (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Note</Text>
            <Text style={styles.detailValue}>{expense.note}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  categoryIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  amountContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#5E5CE6',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
});