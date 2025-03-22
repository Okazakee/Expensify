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
import { Ionicons } from '@expo/vector-icons';

import { formatCurrency, parseAmount } from '../utils/currencyUtils';

// Transaction recurrence types
type RecurrenceType = 'monthly' | 'yearly' | 'custom';

// Transaction interface
interface RecurringTransaction {
  id: string;
  amount: number;
  note: string;
  isIncome: boolean;
  recurrenceType: RecurrenceType;
  startDate?: string;
  endDate?: string;
}

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
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly');

  // For custom date range
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [selectingStartDate, setSelectingStartDate] = useState<boolean>(true);

  // Set initial values if editing an existing transaction
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
    if (initialTransaction) {
      setAmount(initialTransaction.amount.toString());
      setNote(initialTransaction.note || '');
      setRecurrenceType(initialTransaction.recurrenceType || 'monthly');

      if (initialTransaction.startDate) {
        setStartDate(new Date(initialTransaction.startDate));
      }

      if (initialTransaction.endDate) {
        setEndDate(new Date(initialTransaction.endDate));
      }
    } else {
      // Reset form for new transactions
      setAmount('');
      setNote('');
      setRecurrenceType('monthly');
      setStartDate(new Date());
      setEndDate(new Date());
    }
  }, [initialTransaction, isVisible]);

  const handleSave = async () => {
    try {
      // Parse the input to get a numeric value
      const parsedAmount = parseAmount(amount);

      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount greater than zero.');
        return;
      }

      // Prepare transaction data
      const transactionData: RecurringTransaction = {
        amount: parsedAmount,
        note,
        recurrenceType,
        startDate: recurrenceType === 'custom' ? startDate.toISOString() : undefined,
        endDate: recurrenceType === 'custom' ? endDate.toISOString() : undefined,
        isIncome,
        id: initialTransaction ? initialTransaction.id : Date.now().toString()
      };

      console.log('Saving transaction', transactionData);

      // In a real app, we would call a function to save the transaction
      // If editing: updateTransaction(transactionData)
      // If creating: addTransaction(transactionData)

      // Reset form and close
      setAmount('');
      setNote('');
      setRecurrenceType('monthly');
      onClose();

    } catch (error) {
      console.error('Failed to save transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const openDatePicker = (isStart: boolean) => {
    setSelectingStartDate(isStart);
    setTempDate(isStart ? startDate : endDate);
    setShowDatePicker(true);
  };

  const handleConfirmDate = () => {
    if (selectingStartDate) {
      setStartDate(tempDate);
    } else {
      setEndDate(tempDate);
    }
    setShowDatePicker(false);
  };

  // Simple date picker UI
  const renderDatePicker = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 10}, (_, i) => currentYear - i);

    const days = Array.from({length: 31}, (_, i) => i + 1);

    const yearOptions = years.map(year => (
      <TouchableOpacity
        key={`year-${year}`}
        style={[styles.pickerOption, tempDate.getFullYear() === year && styles.selectedPickerOption]}
        onPress={() => {
          const newDate = new Date(tempDate);
          newDate.setFullYear(year);
          setTempDate(newDate);
        }}
      >
        <Text style={[styles.pickerOptionText, tempDate.getFullYear() === year && styles.selectedPickerOptionText]}>
          {year}
        </Text>
      </TouchableOpacity>
    ));

    const monthOptions = months.map((month, index) => (
      <TouchableOpacity
        key={`month-${
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          index
        }`}
        style={[styles.pickerOption, tempDate.getMonth() === index && styles.selectedPickerOption]}
        onPress={() => {
          const newDate = new Date(tempDate);
          newDate.setMonth(index);
          setTempDate(newDate);
        }}
      >
        <Text style={[styles.pickerOptionText, tempDate.getMonth() === index && styles.selectedPickerOptionText]}>
          {month}
        </Text>
      </TouchableOpacity>
    ));

    const dayOptions = days.map(day => (
      <TouchableOpacity
        key={`day-${day}`}
        style={[styles.pickerOption, tempDate.getDate() === day && styles.selectedPickerOption]}
        onPress={() => {
          const newDate = new Date(tempDate);
          newDate.setDate(day);
          setTempDate(newDate);
        }}
      >
        <Text style={[styles.pickerOptionText, tempDate.getDate() === day && styles.selectedPickerOptionText]}>
          {day}
        </Text>
      </TouchableOpacity>
    ));

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.datePickerContainer}>
            <Text style={styles.datePickerTitle}>
              Select {selectingStartDate ? "Start" : "End"} Date
            </Text>

            <View style={styles.datePickerContent}>
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.pickerScrollView}>
                  {yearOptions}
                </ScrollView>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.pickerScrollView}>
                  {monthOptions}
                </ScrollView>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.pickerScrollView}>
                  {dayOptions}
                </ScrollView>
              </View>
            </View>

            <View style={styles.datePickerButtons}>
              <TouchableOpacity
                style={[styles.datePickerButton, styles.cancelDateButton]}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.cancelDateButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.datePickerButton, styles.confirmDateButton]}
                onPress={handleConfirmDate}
              >
                <Text style={styles.confirmDateButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
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
                  recurrenceType === 'custom' && styles.selectedRecurrenceOption
                ]}
                onPress={() => {
                  setRecurrenceType('custom');
                }}
              >
                <Text style={[
                  styles.recurrenceOptionText,
                  recurrenceType === 'custom' && styles.selectedRecurrenceOptionText
                ]}>Custom</Text>
              </TouchableOpacity>
            </View>
          </View>

          {recurrenceType === 'custom' && (
            <View style={styles.dateRangeContainer}>
              <Text style={styles.sectionLabel}>Date Range</Text>

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>Start:</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => openDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color="white" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateRow}>
                <Text style={styles.dateLabel}>End:</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => openDatePicker(false)}
                >
                  <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                  <Ionicons name="calendar-outline" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {renderDatePicker()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
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
  dateRangeContainer: {
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    width: 50,
    fontSize: 14,
    color: '#FFFFFF',
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateText: {
    fontSize: 14,
    color: '#FFFFFF',
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
  // Date picker styles
  datePickerContainer: {
    width: '90%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  pickerScrollView: {
    height: 200,
  },
  pickerOption: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  selectedPickerOption: {
    backgroundColor: 'rgba(80, 227, 194, 0.2)',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedPickerOptionText: {
    color: '#50E3C2',
    fontWeight: '600',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelDateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  confirmDateButton: {
    backgroundColor: '#50E3C2',
    marginLeft: 8,
  },
  cancelDateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmDateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TransactionEditor;