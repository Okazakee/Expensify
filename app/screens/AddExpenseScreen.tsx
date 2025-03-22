import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import ExpenseForm from '../components/ExpenseForm';

const AddExpenseScreen = () => {
  const router = useRouter();

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
          title: 'Add Expense',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />
      <View style={styles.content}>
        <ExpenseForm
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