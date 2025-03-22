import type React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TransactionEditor from './TransactionEditor';

interface IncomeSectionProps {
  onIncomePress?: () => void;
  onExpensePress?: () => void;
}

const IncomeSection: React.FC<IncomeSectionProps> = () => {
  const router = useRouter();
  const [showIncomeEditor, setShowIncomeEditor] = useState(false);
  const [showExpenseEditor, setShowExpenseEditor] = useState(false);

  const handleIncomePress = () => {
    setShowIncomeEditor(true);
  };

  const handleExpensePress = () => {
    setShowExpenseEditor(true);
  };

  const handleManageTransactions = () => {
    // Navigate to transactions management screen
    router.push('/transactions');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Periodic Transactions</Text>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={handleManageTransactions}
        >
          <Text style={styles.manageButtonText}>Manage transactions</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.incomeButton]}
          onPress={handleIncomePress}
        >
          <Ionicons name="arrow-down-circle" size={20} color="#15E8FE" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Income</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.expenseButton]}
          onPress={handleExpensePress}
        >
          <Ionicons name="arrow-up-circle" size={20} color="#FF6B6B" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Income Editor Modal */}
      <TransactionEditor
        isVisible={showIncomeEditor}
        onClose={() => setShowIncomeEditor(false)}
        isIncome={true}
      />

      {/* Expense Editor Modal */}
      <TransactionEditor
        isVisible={showExpenseEditor}
        onClose={() => setShowExpenseEditor(false)}
        isIncome={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 12,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  incomeButton: {
    marginRight: 8,
    borderColor: 'rgba(80, 224, 227, 0.3)',
    backgroundColor: 'rgba(21, 232, 254, 0.3)',
  },
  expenseButton: {
    marginLeft: 8,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(21, 232, 254, 0.2)',
    borderRadius: 4,
  },
  manageButtonText: {
    color: '#15E8FE',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default IncomeSection;