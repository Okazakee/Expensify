// app/utils/exportUtils.ts
import * as FileSystem from 'expo-file-system';
import { Share, Platform, Alert } from 'react-native';
import { formatFullDate } from './dateUtils';
import type { Transaction, Category } from '../database/schema';

// Function to convert transactions data to CSV format
export const transactionsToCSV = (
  transactions: Transaction[],
  categories: Category[]
): string => {
  // Create CSV header
  const header = 'Date,Type,Category,Amount,Note\n';

  // Create CSV rows
  const rows = transactions.map(transaction => {
    // Find category name
    const category = categories.find(c => c.id === transaction.category);
    const categoryName = category ? category.name : 'Unknown';

    // Format transaction data
    const date = formatFullDate(transaction.date);
    const type = transaction.isIncome ? 'Income' : 'Expense';
    const amount = transaction.amount.toFixed(2);
    // Make sure notes with commas are properly quoted
    const note = transaction.note ? `"${transaction.note.replace(/"/g, '""')}"` : '';

    return `${date},${type},${categoryName},${amount},${note}`;
  }).join('\n');

  return header + rows;
};

// Function to export data to a CSV file and share it
// Generate a full financial report as CSV
export const generateFinancialReport = async (
  transactions: Transaction[],
  categories: Category[],
  monthlyData: {
    expenses: {month: number, total: number}[];
    incomes: {month: number, total: number}[];
  },
  categoryTotals: {
    expenses: {categoryId: string, total: number}[];
    incomes: {categoryId: string, total: number}[];
  }
): Promise<string> => {
  const lines: string[] = [];

  // Add header
  lines.push('EXPENSIFY FINANCIAL REPORT');
  lines.push(`Generated on: ${formatFullDate(new Date().toISOString())}`);
  lines.push('');

  // Add monthly summary
  lines.push('MONTHLY SUMMARY');
  lines.push('Month,Income,Expense,Net');

  // Combine income and expense data by month
  const allMonths = new Set<number>();
  // biome-ignore lint/complexity/noForEach: <explanation>
  monthlyData.expenses.forEach(item => allMonths.add(item.month));
  // biome-ignore lint/complexity/noForEach: <explanation>
  monthlyData.incomes.forEach(item => allMonths.add(item.month));

  const sortedMonths = Array.from(allMonths).sort((a, b) => a - b);

  // biome-ignore lint/complexity/noForEach: <explanation>
    sortedMonths.forEach(month => {
    const income = monthlyData.incomes.find(i => i.month === month)?.total || 0;
    const expense = monthlyData.expenses.find(e => e.month === month)?.total || 0;
    const net = income - expense;

    const monthName = new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
    lines.push(`${monthName},${income.toFixed(2)},${expense.toFixed(2)},${net.toFixed(2)}`);
  });

  lines.push('');

  // Add category breakdown
  lines.push('EXPENSE CATEGORIES');
  lines.push('Category,Amount,Percentage');

  const totalExpenses = categoryTotals.expenses.reduce((sum, item) => sum + item.total, 0);

  // biome-ignore lint/complexity/noForEach: <explanation>
    categoryTotals.expenses.forEach(item => {
    const category = categories.find(c => c.id === item.categoryId);
    const categoryName = category ? category.name : 'Unknown';
    const percentage = totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0;

    lines.push(`${categoryName},${item.total.toFixed(2)},${percentage.toFixed(2)}%`);
  });

  lines.push('');

  lines.push('INCOME CATEGORIES');
  lines.push('Category,Amount,Percentage');

  const totalIncomes = categoryTotals.incomes.reduce((sum, item) => sum + item.total, 0);

  // biome-ignore lint/complexity/noForEach: <explanation>
    categoryTotals.incomes.forEach(item => {
    const category = categories.find(c => c.id === item.categoryId);
    const categoryName = category ? category.name : 'Unknown';
    const percentage = totalIncomes > 0 ? (item.total / totalIncomes) * 100 : 0;

    lines.push(`${categoryName},${item.total.toFixed(2)},${percentage.toFixed(2)}%`);
  });

  lines.push('');

  // Add transaction list
  lines.push('TRANSACTIONS');
  lines.push('Date,Type,Category,Amount,Note');

  // biome-ignore lint/complexity/noForEach: <explanation>
    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category);
      const categoryName = category ? category.name : 'Unknown';

      const date = formatFullDate(transaction.date);
      const type = transaction.isIncome ? 'Income' : 'Expense';
      const amount = transaction.amount.toFixed(2);
      const note = transaction.note ? `"${transaction.note.replace(/"/g, '""')}"` : '';

      lines.push(`${date},${type},${categoryName},${amount},${note}`);
    });

  return lines.join('\n');
};

export const exportToCSV = async (
  transactions: Transaction[],
  categories: Category[],
  fileName = 'expensify_export' as string // Type assertion for default value
): Promise<void> => {
  try {
    const csvContent = transactionsToCSV(transactions, categories);
    const finalFileName = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    const filePath = `${FileSystem.documentDirectory}${finalFileName}`;

    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8
    });

    const shareOptions = {
      title: 'Export Transactions',
      url: Platform.OS === 'android'
        ? await FileSystem.getContentUriAsync(filePath)
        : filePath
    };

    await Share.share(shareOptions);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    throw error;
  }
};

// Function to export specific period data
export const exportPeriodData = async (
  transactions: Transaction[],
  categories: Category[],
  periodName: string
): Promise<void> => {
  try {
    const date = new Date();
    const timestamp = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;

    const fileName = `expensify_${periodName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;

    await exportToCSV(transactions, categories, fileName);
  } catch (error) {
    console.error('Error exporting period data:', error);
    Alert.alert(
      'Export Failed',
      'There was an error exporting your data. Please try again.'
    );
    throw error;
  }
};

// Export comprehensive financial report
export const exportFinancialReport = async (
  transactions: Transaction[],
  categories: Category[],
  monthlyData: {
    expenses: {month: number, total: number}[];
    incomes: {month: number, total: number}[];
  },
  categoryTotals: {
    expenses: {categoryId: string, total: number}[];
    incomes: {categoryId: string, total: number}[];
  },
  periodName: string
): Promise<void> => {
  try {
    const date = new Date();
    const timestamp = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
    const fileName = `expensify_report_${periodName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;

    // Generate report content
    const reportContent = await generateFinancialReport(
      transactions,
      categories,
      monthlyData,
      categoryTotals
    );

    // Create file path in app's document directory
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write report content to file
    await FileSystem.writeAsStringAsync(filePath, reportContent, {
      encoding: FileSystem.EncodingType.UTF8
    });

    // Share the file
    if (Platform.OS === 'ios') {
      await Share.share({
        url: filePath,
        title: 'Expensify Financial Report'
      });
    } else {
      // For Android, we need to use a content URI
      const fileUri = await FileSystem.getContentUriAsync(filePath);
      await Share.share({
        url: fileUri,
        title: 'Expensify Financial Report'
      });
    }

    return;
  } catch (error) {
    console.error('Error exporting financial report:', error);
    Alert.alert(
      'Export Failed',
      'There was an error exporting your financial report. Please try again.'
    );
    throw error;
  }
};

export default {
  transactionsToCSV,
  exportToCSV,
  exportPeriodData,
  exportFinancialReport,
  generateFinancialReport
};