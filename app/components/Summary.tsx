import type React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { formatCurrency } from '../utils/currencyUtils';
import PeriodSelector from './PeriodSelector';
import BudgetEditor from './BudgetEditor';
import { useBudget } from '../contexts/BudgetContext';

interface SummaryProps {
  spent: number;
  income: number;
  net: number;
  title?: string;
  showPercentage?: boolean;
}

const Summary: React.FC<SummaryProps> = ({
  spent,
  income,
  net,
  title = 'Monthly Summary',
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

      {/* Income Row */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Income</Text>
        <Text style={[styles.summaryValue, styles.incomeValue]}>
          {formatCurrency(income)}
        </Text>
      </View>

      {/* Expense Row */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Expenses</Text>
        <Text style={[styles.summaryValue, styles.expenseValue]}>
          {formatCurrency(spent)}
        </Text>
      </View>

      {/* Net Row */}
      <View style={[styles.summaryRow, styles.netRow]}>
        <Text style={styles.netLabel}>Net</Text>
        <Text style={[
          styles.netValue,
          net >= 0 ? styles.positiveNetValue : styles.negativeNetValue
        ]}>
          {formatCurrency(net)}
        </Text>
      </View>

      {/* Budget Section if budget is set */}
      {isBudgetSet && (
        <>
          <View style={styles.divider} />

          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <View style={styles.budgetValueContainer}>
              <Text style={styles.budgetValue}>{formatCurrency(budget)}</Text>
              <TouchableOpacity onPress={handleEditBudget} style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${Math.min(percentUsed, 100)}%` },
                isOverBudget && styles.overBudgetBar
              ]}
            />
          </View>

          {showPercentage && (
            <Text style={[styles.progressText, isOverBudget && styles.overBudgetText]}>
              {percentUsed.toFixed(0)}% used • {isOverBudget ? 'Over budget by ' : ''}{formatCurrency(Math.abs(remaining))} {!isOverBudget ? 'remaining' : ''}
            </Text>
          )}
        </>
      )}

      {/* No Budget Set Message */}
      {!isBudgetSet && (
        <>
          <View style={styles.divider} />
          <View style={styles.noBudgetContainer}>
            <Text style={styles.noBudgetText}>
              No budget set for this month
            </Text>
            <TouchableOpacity onPress={handleEditBudget} style={styles.setBudgetButton}>
              <Text style={styles.setBudgetButtonText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </>
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
    marginBottom: 16,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888888',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  incomeValue: {
    color: '#4CAF50',
  },
  expenseValue: {
    color: '#FF6B6B',
  },
  netRow: {
    marginTop: 4,
    marginBottom: 0,
  },
  netLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  netValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  positiveNetValue: {
    color: '#4CAF50',
  },
  negativeNetValue: {
    color: '#FF6B6B',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    color: '#888888',
  },
  budgetValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(80, 202, 227, 0.2)',
    borderRadius: 4,
  },
  editButtonText: {
    color: '#15E8FE',
    fontSize: 12,
    fontWeight: '600',
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
    backgroundColor: '#15E8FE',
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
  noBudgetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noBudgetText: {
    fontSize: 14,
    color: '#888888',
    fontStyle: 'italic',
  },
  setBudgetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(80, 202, 227, 0.2)',
    borderRadius: 4,
  },
  setBudgetButtonText: {
    color: '#15E8FE',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default Summary;