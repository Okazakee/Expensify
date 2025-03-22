import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import ExpenseForm from '../../components/ExpenseForm';
import { useExpenses } from '../../contexts/ExpensesContext';
import type { Expense } from '../../database/schema';

export default function EditExpenseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { expenses } = useExpenses();
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      const foundExpense = expenses.find(expense => expense.id === id);
      if (foundExpense) {
        setExpenseToEdit(foundExpense);
      }
    }
    setLoading(false);
  }, [id, expenses]);

  const handleSubmit = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Edit Expense',
            headerStyle: {
              backgroundColor: '#1A1A1A',
            },
            headerTintColor: '#FFFFFF',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading expense data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!expenseToEdit) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Edit Expense',
            headerStyle: {
              backgroundColor: '#1A1A1A',
            },
            headerTintColor: '#FFFFFF',
            headerShadowVisible: false,
          }}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Expense not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Expense',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <ExpenseForm
          initialExpense={expenseToEdit}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
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
});