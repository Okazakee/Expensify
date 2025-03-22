import type React from 'react';
import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';

import { useBudget } from '../contexts/BudgetContext';
import { usePeriod } from '../contexts/PeriodContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { formatCurrency, parseAmount } from '../utils/currencyUtils';

interface BudgetEditorProps {
  isVisible: boolean;
  onClose: () => void;
}

const BudgetEditor: React.FC<BudgetEditorProps> = ({ isVisible, onClose }) => {
  const { currentBudget, setBudgetForCurrentPeriod, clearBudgetForCurrentPeriod } = useBudget();
  const { selectedMonthName, selectedYear } = usePeriod();
  const { currentCurrency } = useCurrency();

  const [budgetInput, setBudgetInput] = useState(
    currentBudget !== null ? currentBudget.toString() : ''
  );

  const handleSave = async () => {
    try {
      // Parse the input to get a numeric value
      const amount = parseAmount(budgetInput);

      if (Number.isNaN(amount) || amount <= 0) {
        Alert.alert('Invalid Budget', 'Please enter a valid budget amount greater than zero.');
        return;
      }

      // Save the budget
      await setBudgetForCurrentPeriod(amount);
      onClose();
    } catch (error) {
      console.error('Failed to save budget:', error);
      Alert.alert('Error', 'Failed to save budget. Please try again.');
    }
  };

  const handleClear = async () => {
    try {
      await clearBudgetForCurrentPeriod();
      onClose();
    } catch (error) {
      console.error('Failed to clear budget:', error);
      Alert.alert('Error', 'Failed to clear budget. Please try again.');
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Set Budget</Text>
          <Text style={styles.periodText}>
            {selectedMonthName} {selectedYear}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>{currentCurrency.symbol}</Text>
            <TextInput
              style={styles.input}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="Enter budget amount"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="decimal-pad"
              autoFocus
            />
          </View>

          <View style={styles.currentBudgetContainer}>
            <Text style={styles.currentBudgetLabel}>Current Budget:</Text>
            <Text style={styles.currentBudgetValue}>
              {currentBudget !== null ? formatCurrency(currentBudget) : 'Not set'}
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  periodText: {
    fontSize: 16,
    color: '#15E8FE',
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
  currentBudgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  currentBudgetLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  currentBudgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    marginRight: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
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
});

export default BudgetEditor;