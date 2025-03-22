import React, { useState, useEffect, useRef } from 'react';
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
  const isMounted = useRef(true);

  // Clear initial expense when component mounts/unmounts
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      setInitialExpense(undefined);
    };
  }, []);

  useEffect(() => {
    // Check if we're editing an existing expense
    if (params.expenseId && typeof params.expenseId === 'string') {
      const expenseToEdit = expenses.find(expense => expense.id === params.expenseId);
      if (expenseToEdit && isMounted.current) {
        setInitialExpense(expenseToEdit);
      }
    } else {
      // If not editing, clear any previous initial expense
      setInitialExpense(undefined);
    }
  }, [params.expenseId, expenses]);

  const handleSubmit = () => {
    // Clear initialExpense before navigating back
    setInitialExpense(undefined);
    router.back();
  };

  const handleCancel = () => {
    // Clear initialExpense before navigating back
    setInitialExpense(undefined);
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
    paddingTop: 60,
    paddingBottom: 60
  },
  content: {
    flex: 1,
  },
});

export default AddExpenseScreen;