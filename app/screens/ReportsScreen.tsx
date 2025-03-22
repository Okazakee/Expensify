import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  RefreshControl
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart } from 'react-native-chart-kit';

import { useExpenses } from '../contexts/ExpensesContext';
import { formatCurrency } from '../utils/currencyUtils';
import { getMonthName } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const {
    categoryTotals,
    monthlyExpenseData,
    categories,
    monthlyTotal,
    isLoading,
    refreshData
  } = useExpenses();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Prepare category data for pie chart
  const pieChartData = categoryTotals.map(item => {
    const category = categories.find(c => c.id === item.categoryId);
    return {
      name: category ? category.name : 'Unknown',
      amount: item.total,
      color: category ? category.color : '#9CA3AF',
      legendFontColor: '#FFFFFF',
      legendFontSize: 12
    };
  }).sort((a, b) => b.amount - a.amount);

  // Prepare monthly data for line chart
  const lineChartData = {
    labels: monthlyExpenseData.map(data => getMonthName(data.month).substring(0, 3)),
    datasets: [
      {
        data: monthlyExpenseData.map(data => data.total),
        color: () => '#50E3C2',
        strokeWidth: 2
      }
    ]
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

  const renderCategoryBreakdown = () => {
    return pieChartData.map((item, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
      <View key={index} style={styles.categoryBreakdownItem}>
        <View style={styles.categoryLabelContainer}>
          <View style={[styles.categoryColorDot, { backgroundColor: item.color }]} />
          <Text style={styles.categoryLabel}>{item.name}</Text>
        </View>
        <View style={styles.categoryAmountContainer}>
          <Text style={styles.categoryAmount}>{formatCurrency(item.amount)}</Text>
          <Text style={styles.categoryPercentage}>
            {((item.amount / monthlyTotal) * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    ));
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
            {/* Spending by Category */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Spending by Category</Text>

              {pieChartData.length > 0 ? (
                <>
                  <View style={styles.chartContainer}>
                    <PieChart
                      data={pieChartData}
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
                    {renderCategoryBreakdown()}
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>No category data available</Text>
              )}
            </View>

            {/* Monthly Spending Trend */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Monthly Spending Trend</Text>

              {monthlyExpenseData.length > 0 ? (
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
                  />
                </View>
              ) : (
                <Text style={styles.emptyText}>No monthly trend data available</Text>
              )}
            </View>

            {/* Export Options */}
            <View style={styles.exportContainer}>
              <TouchableOpacity style={styles.exportButton}>
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