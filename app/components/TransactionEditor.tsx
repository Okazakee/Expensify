// app/components/TransactionEditor.tsx
import type React from 'react';
import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useRecurringTransactions } from '../contexts/RecurringTransactionsContext';
import { useExpenses } from '../contexts/ExpensesContext';
import { formatCurrency, parseAmount } from '../utils/currencyUtils';
import CategoryPicker from './CategoryPicker';
import type { RecurringTransaction } from '../database/schema';

// Transaction recurrence types
type RecurrenceType = 'monthly' | 'yearly' | 'weekly';

interface TransactionEditorProps {
  isVisible: boolean;
  onClose: () => void;
  isIncome?: boolean;
  initialTransaction?: RecurringTransaction | null;
}

const TransactionEditor: React.FC<TransactionEditorProps> = ({
  isVisible,
  onClose,
  isIncome = true,
  initialTransaction = null
}) => {
  const { addTransaction, updateTransaction } = useRecurringTransactions();
  const { categories } = useExpenses();

  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For monthly recurrence
  const [selectedDay, setSelectedDay] = useState<number>(1);

  // For yearly recurrence
  const [selectedMonth, setSelectedMonth] = useState<number>(1);
  const [selectedYearlyDay, setSelectedYearlyDay] = useState<number>(1);

  // For weekly recurrence
  const [selectedWeekday, setSelectedWeekday] = useState<number>(1); // 1 = Monday, 7 = Sunday

  // Set initial values if editing an existing transaction
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (initialTransaction) {
      setAmount(initialTransaction.amount.toString());
      setNote(initialTransaction.note || '');
      setRecurrenceType(initialTransaction.recurrenceType || 'monthly');
      setSelectedCategory(initialTransaction.category || null);

      if (initialTransaction.day) {
        setSelectedDay(initialTransaction.day);
        setSelectedYearlyDay(initialTransaction.day);
      }

      if (initialTransaction.month) {
        setSelectedMonth(initialTransaction.month);
      }

      if (initialTransaction.weekday) {
        setSelectedWeekday(initialTransaction.weekday);
      }
    } else {
      // Reset form for new transactions
      setAmount('');
      setNote('');
      setRecurrenceType('monthly');
      setSelectedDay(1);
      setSelectedMonth(1);
      setSelectedYearlyDay(1);
      setSelectedWeekday(1);
      setSelectedCategory(null);
    }
  }, [initialTransaction, isVisible]);

  const validateForm = (): boolean => {
    if (!amount || parseAmount(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
      return false;
    }

    if (!isIncome && !selectedCategory) {
      Alert.alert('Category Required', 'Please select a category for this expense.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare transaction data based on recurrence type
      const parsedAmount = parseAmount(amount);
      
      const transactionData: Omit<RecurringTransaction, 'id' | 'lastProcessed' | 'nextDue'> = {
        amount: parsedAmount,
        note,
        recurrenceType,
        isIncome,
        category: isIncome ? '' : selectedCategory || '',
        active: true
      };

      // Add specific properties based on recurrence type
      if (recurrenceType === 'monthly') {
        transactionData.day = selectedDay;
      } else if (recurrenceType === 'yearly') {
        transactionData.month = selectedMonth;
        transactionData.day = selectedYearlyDay;
      } else if (recurrenceType === 'weekly') {
        transactionData.weekday = selectedWeekday;
      }

      if (initialTransaction) {
        // Update existing transaction
        await updateTransaction({
          ...transactionData,
          id: initialTransaction.id,
          lastProcessed: initialTransaction.lastProcessed,
          nextDue: initialTransaction.nextDue
        });
      } else {
        // Create new transaction
        await addTransaction(transactionData);
      }

      // Reset form and close
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      setIsSubmitting(false);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  };

  const handleCancel = () => {
    onClose();
  };
  
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  // Generate options for day selection (1-31)
  const renderDayOptions = () => {
    const days = Array.from({length: 31}, (_, i) => i + 1);
    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.sectionLabel}>Day of month</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}>
          {days.map(day => (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayOption,
                selectedDay === day && styles.selectedDayOption
              ]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[
                styles.dayOptionText,
                selectedDay === day && styles.selectedDayOptionText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Generate options for month selection (Jan-Dec)
  const renderMonthOptions = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.sectionLabel}>Month</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthsContainer}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={`weekday-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
              }`}
              style={[
                styles.monthOption,
                selectedMonth === index + 1 && styles.selectedMonthOption
              ]}
              onPress={() => setSelectedMonth(index + 1)}
            >
              <Text style={[
                styles.monthOptionText,
                selectedMonth === index + 1 && styles.selectedMonthOptionText
              ]}>
                {month.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Generate options for yearly day selection (1-31)
  const renderYearlyDayOptions = () => {
    const days = Array.from({length: 31}, (_, i) => i + 1);
    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.sectionLabel}>Day of month</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysContainer}>
          {days.map(day => (
            <TouchableOpacity
              key={`yearly-day-${day}`}
              style={[
                styles.dayOption,
                selectedYearlyDay === day && styles.selectedDayOption
              ]}
              onPress={() => setSelectedYearlyDay(day)}
            >
              <Text style={[
                styles.dayOptionText,
                selectedYearlyDay === day && styles.selectedDayOptionText
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Generate options for weekday selection (Mon-Sun)
  const renderWeekdayOptions = () => {
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
      <View style={styles.selectorContainer}>
        <Text style={styles.sectionLabel}>Day of week</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekdaysContainer}>
          {weekdays.map((weekday, index) => (
            <TouchableOpacity
              key={`weekday-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
              }`}
              style={[
                styles.weekdayOption,
                selectedWeekday === index + 1 && styles.selectedWeekdayOption
              ]}
              onPress={() => setSelectedWeekday(index + 1)}
            >
              <Text style={[
                styles.weekdayOptionText,
                selectedWeekday === index + 1 && styles.selectedWeekdayOptionText
              ]}>
                {weekday.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {initialTransaction
                ? `Edit ${isIncome ? 'Income' : 'Expense'}`
                : `Add Recurring ${isIncome ? 'Income' : 'Expense'}`}
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.noteContainer}>
              <Text style={styles.sectionLabel}>Description (Optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Add a note"
                placeholderTextColor="rgba(255, 255, 255, 0.3)"
                multiline
              />
            </View>

            {!isIncome && (
              <View style={styles.categoryContainer}>
                <Text style={styles.sectionLabel}>Category</Text>
                <CategoryPicker
                  categories={categories}
                  selectedCategoryId={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                />
              </View>
            )}

            <View style={styles.recurrenceContainer}>
              <Text style={styles.sectionLabel}>Recurrence</Text>
              <View style={styles.recurrenceOptions}>
                <TouchableOpacity
                  style={[
                    styles.recurrenceOption,
                    recurrenceType === 'monthly' && styles.selectedRecurrenceOption
                  ]}
                  onPress={() => {
                    setRecurrenceType('monthly');
                  }}
                >
                  <Text style={[
                    styles.recurrenceOptionText,
                    recurrenceType === 'monthly' && styles.selectedRecurrenceOptionText
                  ]}>Monthly</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recurrenceOption,
                    recurrenceType === 'yearly' && styles.selectedRecurrenceOption
                  ]}
                  onPress={() => {
                    setRecurrenceType('yearly');
                  }}
                >
                  <Text style={[
                    styles.recurrenceOptionText,
                    recurrenceType === 'yearly' && styles.selectedRecurrenceOptionText
                  ]}>Yearly</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.recurrenceOption,
                    recurrenceType === 'weekly' && styles.selectedRecurrenceOption
                  ]}
                  onPress={() => {
                    setRecurrenceType('weekly');
                  }}
                >
                  <Text style={[
                    styles.recurrenceOptionText,
                    recurrenceType === 'weekly' && styles.selectedRecurrenceOptionText
                  ]}>Weekly</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Render specific options based on recurrence type */}
            {recurrenceType === 'monthly' && renderDayOptions()}

            {recurrenceType === 'yearly' && (
              <>
                {renderMonthOptions()}
                {renderYearlyDayOptions()}
              </>
            )}

            {recurrenceType === 'weekly' && renderWeekdayOptions()}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.saveButtonText}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  noteContainer: {
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    marginBottom: 16,
  },
  recurrenceContainer: {
    marginBottom: 16,
  },
  recurrenceOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recurrenceOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 4,
    borderRadius: 8,
  },
  selectedRecurrenceOption: {
    backgroundColor: 'rgba(21, 232, 254, 0.2)',
    borderColor: '#15E8FE',
    borderWidth: 1,
  },
  recurrenceOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedRecurrenceOptionText: {
    color: '#15E8FE',
    fontWeight: '600',
  },
  // Day selector styles
  selectorContainer: {
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dayOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  selectedDayOption: {
    backgroundColor: 'rgba(21, 232, 254, 0.2)',
    borderColor: '#15E8FE',
    borderWidth: 1,
  },
  dayOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedDayOptionText: {
    color: '#15E8FE',
    fontWeight: '600',
  },
  // Month selector styles
  monthsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  monthOption: {
    minWidth: 60,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    paddingHorizontal: 10,
  },
  selectedMonthOption: {
    backgroundColor: 'rgba(21, 232, 254, 0.2)',
    borderColor: '#15E8FE',
    borderWidth: 1,
  },
  monthOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedMonthOptionText: {
    color: '#15E8FE',
    fontWeight: '600',
  },
  // Weekday selector styles
  weekdaysContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  weekdayOption: {
    minWidth: 60,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    paddingHorizontal: 10,
  },
  selectedWeekdayOption: {
    backgroundColor: 'rgba(21, 232, 254, 0.2)',
    borderColor: '#15E8FE',
    borderWidth: 1,
  },
  weekdayOptionText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedWeekdayOptionText: {
    color: '#15E8FE',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#15E8FE',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  }
});

export default TransactionEditor;