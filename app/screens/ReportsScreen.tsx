import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl,
  Switch
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart } from 'react-native-chart-kit';

import { useTransactions } from '../contexts/TransactionsContext';
import { usePeriod } from '../contexts/PeriodContext'; // Add this import
import { formatCurrency } from '../utils/currencyUtils';
import { getMonthName } from '../utils/dateUtils';
import { exportFinancialReport } from '../utils/exportUtils';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const {
    categoryTotals,
    monthlyData,
    categories,
    monthlyTotal,
    isLoading,
    refreshData,
    currentPeriodTransactions // Add this to destructuring
  } = useTransactions();

  // Add this to get the current period info
  const { selectedMonthName, selectedYear } = usePeriod();

  const [refreshing, setRefreshing] = useState(false);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showIncomes, setShowIncomes] = useState(true);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Prepare category data for pie charts
  const expensesPieChartData = categoryTotals.expenses.map(item => {
    const category = categories.find(c => c.id === item.categoryId);
    return {
      name: category ? category.name : 'Unknown',
      amount: item.total,
      color: category ? category.color : '#9CA3AF',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12
    };
  }).sort((a, b) => b.amount - a.amount);

  const incomesPieChartData = categoryTotals.incomes.map(item => {
    const category = categories.find(c => c.id === item.categoryId);
    return {
      name: category ? category.name : 'Unknown',
      amount: item.total,
      color: category ? category.color : '#9CA3AF',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12
    };
  }).sort((a, b) => b.amount - a.amount);

  // Prepare monthly data for line charts
  const lineChartData = {
    labels: monthlyData.expenses.map(data => getMonthName(data.month).substring(0, 3)),
    datasets: [
      {
        data: monthlyData.expenses.map(data => data.total),
        color: () => '#FF6B6B', // Red for expenses
        strokeWidth: 2
      },
      {
        data: monthlyData.incomes.map(data => data.total),
        color: () => '#4CAF50', // Green for incomes
        strokeWidth: 2
      }
    ],
    legend: ['Expenses', 'Incomes']
  };

  const chartConfig = {
    backgroundGradientFrom: '#1E1E1E',
    backgroundGradientTo: '#1E1E1E',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#5E5CE6'
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const renderCategoryBreakdown = (data: any[], total: number, type: 'expense' | 'income') => {
    if (data.length === 0) {
      return (
        <Text style={styles.emptyText}>No {type} data available</Text>
      );
    }

    return data.map((item, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      <View key={`${type}-${index}`} style={styles.categoryBreakdownItem}>
        <View style={styles.categoryLabelContainer}>
          <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
          <Text style={styles.categoryLabel}>{item.name}</Text>
        </View>
        <View style={styles.categoryAmountContainer}>
          <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
          <Text style={styles.categoryPercentage}>
            {((item.amount / total) * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    ));
  };

  const handleExportReports = async () => {
    try {
      const periodName = `${selectedMonthName}_${selectedYear}`;
      await exportFinancialReport(
        currentPeriodTransactions,
        categories,
        monthlyData,
        categoryTotals,
        periodName
      );
    } catch (error) {
      console.error('Error exporting reports:', error);
      // Alert is already handled in the exportFinancialReport function
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Reports & Analytics',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Financial Analytics</Text>
        <Text style={styles.headerSubtitle}>Track and analyze your spending and income patterns</Text>
      </View>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleOption}>
          <Text style={styles.toggleLabel}>Expenses</Text>
          <Switch
            value={showExpenses}
            onValueChange={setShowExpenses}
            trackColor={{ false: '#3e3e3e', true: 'rgba(255, 107, 107, 0.3)' }}
            thumbColor={showExpenses ? '#FF6B6B' : '#f4f3f4'}
          />
        </View>

        <View style={styles.toggleOption}>
          <Text style={styles.toggleLabel}>Incomes</Text>
          <Switch
            value={showIncomes}
            onValueChange={setShowIncomes}
            trackColor={{ false: '#3e3e3e', true: 'rgba(76, 175, 80, 0.3)' }}
            thumbColor={showIncomes ? '#4CAF50' : '#f4f3f4'}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#50E3C2"
            colors={["#50E3C2"]}
          />
        }
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Loading reports...</Text>
        ) : (
          <>
            {/* Summary Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Monthly Summary</Text>
              <View style={styles.summaryContainer}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Income</Text>
                  <Text style={[styles.summaryValue, styles.incomeValue]}>
                    {formatCurrency(monthlyTotal.incomes)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Expenses</Text>
                  <Text style={[styles.summaryValue, styles.expenseValue]}>
                    {formatCurrency(monthlyTotal.expenses)}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Net</Text>
                  <Text style={[
                    styles.summaryValue,
                    monthlyTotal.net >= 0 ? styles.incomeValue : styles.expenseValue
                  ]}>
                    {formatCurrency(monthlyTotal.net)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Expenses by Category */}
            {showExpenses && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Expenses by Category</Text>

                {expensesPieChartData.length > 0 ? (
                  <>
                    <View style={styles.chartContainer}>
                      <PieChart
                        data={expensesPieChartData}
                        width={width - 32}
                        height={200}
                        chartConfig={chartConfig}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                      />
                    </View>

                    <View style={styles.categoryBreakdownContainer}>
                      {renderCategoryBreakdown(expensesPieChartData, monthlyTotal.expenses, 'expense')}
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>No expense data available</Text>
                )}
              </View>
            )}

            {/* Income by Category */}
            {showIncomes && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Income by Category</Text>

                {incomesPieChartData.length > 0 ? (
                  <>
                    <View style={styles.chartContainer}>
                      <PieChart
                        data={incomesPieChartData}
                        width={width - 32}
                        height={200}
                        chartConfig={chartConfig}
                        accessor="amount"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                      />
                    </View>

                    <View style={styles.categoryBreakdownContainer}>
                      {renderCategoryBreakdown(incomesPieChartData, monthlyTotal.incomes, 'income')}
                    </View>
                  </>
                ) : (
                  <Text style={styles.emptyText}>No income data available</Text>
                )}
              </View>
            )}

            {/* Monthly Spending Trend */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Monthly Trends</Text>

              {(monthlyData.expenses.length > 0 || monthlyData.incomes.length > 0) ? (
                <View style={styles.chartContainer}>
                  <LineChart
                    data={lineChartData}
                    width={width - 32}
                    height={220}
                    chartConfig={chartConfig}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16
                    }}
                    fromZero
                  />
                </View>
              ) : (
                <Text style={styles.emptyText}>No monthly trend data available</Text>
              )}
            </View>

            {/* Export Options */}
            <View style={styles.exportContainer}>
              <TouchableOpacity style={styles.exportButton} onPress={handleExportReports}>
                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Export Reports</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    paddingBottom: 100
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#FFFFFF',
    marginRight: 8,
    fontSize: 16,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBreakdownContainer: {
    marginTop: 8,
  },
  categoryBreakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoryPercentage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 20,
  },
  exportContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ReportsScreen;