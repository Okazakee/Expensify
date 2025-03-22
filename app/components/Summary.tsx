import type React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { formatCurrency } from '../utils/currencyUtils';
import PeriodSelector from './PeriodSelector';
import BudgetEditor from './BudgetEditor';
import { useBudget } from '../contexts/BudgetContext';

interface SummaryProps {
  spent: number;
  title?: string;
  showPercentage?: boolean;
}

const Summary: React.FC<SummaryProps> = ({
  spent,
  title = 'Monthly Budget',
  showPercentage = true
}) => {
  const [showBudgetEditor, setShowBudgetEditor] = useState(false);
  const { currentBudget } = useBudget();

  // Budget is either from context or default (0 if unset)
  const budget = currentBudget !== null ? currentBudget : 0;
  const isBudgetSet = currentBudget !== null;

  // Only calculate these if budget is set
  const percentUsed = isBudgetSet && budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = isBudgetSet ? budget - spent : 0;
  const isOverBudget = isBudgetSet && spent > budget;

  const handleEditBudget = () => {
    Haptics.selectionAsync();
    setShowBudgetEditor(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerActions}>
          <PeriodSelector style={styles.monthSelector} textStyle={styles.month} />
        </View>
      </View>

      <View style={styles.amountsRow}>
        <Text style={styles.spentAmount}>{formatCurrency(spent)}</Text>
          {isBudgetSet && (
            <Text style={styles.budgetAmount}>of {formatCurrency(budget)}</Text>
          )}
          <TouchableOpacity onPress={handleEditBudget} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Budget</Text>
          </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        {isBudgetSet ? (
          <View
            style={[
              styles.progressBar,
              { width: `${Math.min(percentUsed, 100)}%` },
              isOverBudget && styles.overBudgetBar
            ]}
          />
        ) : null}
      </View>

      {isBudgetSet && showPercentage ? (
        <Text style={[styles.progressText, isOverBudget && styles.overBudgetText]}>
          {percentUsed.toFixed(0)}% used • {isOverBudget ? 'Over budget by ' : ''}{formatCurrency(Math.abs(remaining))} {!isOverBudget ? 'remaining' : ''}
        </Text>
      ) : (
        <Text style={styles.noBudgetText}>
          No budget set for this month
        </Text>
      )}

      <BudgetEditor
        isVisible={showBudgetEditor}
        onClose={() => setShowBudgetEditor(false)}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  month: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  monthSelector: {
    padding: 4,
  },
  editButton: {
    marginLeft: 'auto',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(80, 227, 194, 0.2)',
    borderRadius: 4
  },
  editButtonText: {
    color: '#50E3C2',
    fontSize: 12,
    fontWeight: '600',
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spentAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 8,
  },
  budgetAmount: {
    fontSize: 16,
    color: '#888888',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#50E3C2',
    borderRadius: 3,
  },
  overBudgetBar: {
    backgroundColor: '#FF6B6B',
  },
  progressText: {
    fontSize: 14,
    color: '#888888',
  },
  overBudgetText: {
    color: '#FF6B6B',
  },
  noBudgetText: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
});

export default Summary;