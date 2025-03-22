import type React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/currencyUtils';
import PeriodSelector from './PeriodSelector';

interface SummaryProps {
  spent: number;
  budget?: number;
  title?: string;
  showPercentage?: boolean;
}

const Summary: React.FC<SummaryProps> = ({
  spent,
  budget = 750, // Default budget
  title = 'Monthly Budget',
  showPercentage = true
}) => {
  const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOverBudget = spent > budget;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        <PeriodSelector style={styles.monthSelector} textStyle={styles.month} />
      </View>

      <View style={styles.amountsRow}>
        <Text style={styles.spentAmount}>{formatCurrency(spent)}</Text>
        <Text style={styles.budgetAmount}>of {formatCurrency(budget)}</Text>
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
    padding: 4, // Add touch target padding
  },
  amountsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
});

export default Summary;