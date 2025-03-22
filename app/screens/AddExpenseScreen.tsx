import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import ExpenseForm from '../components/ExpenseForm';
import { useExpenses } from '../contexts/ExpensesContext';
import type { Expense } from '../database/schema';

const AddExpenseScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { expenses } = useExpenses();
  const [initialExpense, setInitialExpense] = useState<Expense | undefined>(undefined);

  useEffect(() => {
    // Check if we're editing an existing expense
    if (params.expenseId && typeof params.expenseId === 'string') {
      const expenseToEdit = expenses.find(expense => expense.id === params.expenseId);
      if (expenseToEdit) {
        setInitialExpense(expenseToEdit);
      }
    }
  }, [params.expenseId, expenses]);

  const handleSubmit = () => {
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: initialExpense ? 'Edit Expense' : 'Add Expense',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <ExpenseForm
          initialExpense={initialExpense}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
});

export default AddExpenseScreen;