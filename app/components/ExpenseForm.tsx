import type React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

import type { Expense } from '../database/schema';
import { useExpenses } from '../contexts/ExpensesContext';
import CategoryPicker from './CategoryPicker';
import { formatFullDate, getISODate } from '../utils/dateUtils';
import { parseAmount, validateAmount } from '../utils/currencyUtils';

interface ExpenseFormProps {
  initialExpense?: Expense;
  onSubmit: () => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialExpense,
  onSubmit,
  onCancel
}) => {
  const { categories, addNewExpense, updateExistingExpense } = useExpenses();

  const [amount, setAmount] = useState(initialExpense ? initialExpense.amount.toString() : '');
  const [category, setCategory] = useState<string | null>(initialExpense ? initialExpense.category : null);
  const [date, setDate] = useState(initialExpense ? new Date(initialExpense.date) : new Date());
  const [note, setNote] = useState(initialExpense ? initialExpense.note : '');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{amount?: string; category?: string}>({});

  const isEditing = !!initialExpense;

  const validateForm = (): boolean => {
    const newErrors: {amount?: string; category?: string} = {};

    if (!validateAmount(amount)) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      setIsSubmitting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const expenseData = {
        amount: parseAmount(amount),
        category: category!, /* TODO fix non-null later if possible */
        date: getISODate(date),
        note: note.trim()
      };

      if (isEditing && initialExpense) {
        await updateExistingExpense({
          ...expenseData,
          id: initialExpense.id
        });
      } else {
        await addNewExpense(expenseData);
      }

      onSubmit();
    } catch (error) {
      console.error('Failed to save expense:', error);
      setIsSubmitting(false);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setCategory(categoryId);
    if (errors.category) {
      setErrors({ ...errors, category: undefined });
    }
    Haptics.selectionAsync();
  };

  const handleShowDatePicker = () => {
    setDatePickerVisible(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => { /* TODO fix type later */
    setDatePickerVisible(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (errors.amount) {
                  setErrors({ ...errors, amount: undefined });
                }
              }}
              placeholder="0.00"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>
          {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
        </View>

        <CategoryPicker
          categories={categories}
          selectedCategoryId={category}
          onSelectCategory={handleSelectCategory}
        />
        {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={handleShowDatePicker}
          >
            <Text style={styles.dateButtonText}>{formatFullDate(date.toISOString())}</Text>
            <Ionicons name="calendar-outline" size={20} color="white" />
          </TouchableOpacity>

          {isDatePickerVisible && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              themeVariant="dark"
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add a note"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            multiline
          />
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>{isEditing ? 'Update' : 'Save'}</Text>
            {isSubmitting ? <Ionicons name="sync" size={18} color="black" style={styles.spinnerIcon} /> : null}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    height: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#ffffff',
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: '#50E3C2',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  spinnerIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
});

export default ExpenseForm;