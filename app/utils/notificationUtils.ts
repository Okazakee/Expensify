import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { RecurringTransaction } from '../database/schema';
import { formatCurrency } from './currencyUtils';

// Keys for storing notification settings
const NOTIFICATIONS_ENABLED_KEY = '@expensify_notifications_enabled';
const PUSH_TOKEN_KEY = '@expensify_push_token';
const SCHEDULED_NOTIFICATIONS_KEY = '@expensify_scheduled_notifications';

// Configure default notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and store the token
 */
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  // biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
  let token;

  if (Platform.OS === 'android') {
    // Set notification channel for Android
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#15E8FE',
    });

    // Create a recurring transactions channel for Android
    await Notifications.setNotificationChannelAsync('recurring-transactions', {
      name: 'Recurring Transactions',
      description: 'Notifications for upcoming recurring transactions',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#15E8FE',
    });
  }

  if (Device.isDevice) {
    // Check if we already have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // If we still don't have permission, exit
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the token
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;

    // Store the token
    await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
};

/**
 * Check if notifications are enabled in app settings
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
    // Default to true if not set
    return value === null ? true : value === 'true';
  } catch (error) {
    console.error('Error checking notification settings:', error);
    return false;
  }
};

/**
 * Enable or disable notifications in app settings
 */
export const setNotificationsEnabled = async (enabled: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
};

/**
 * Generate a unique identifier for a transaction notification
 */
const getNotificationIdentifier = (transactionId: string): string => {
  return `transaction_${transactionId}`;
};

/**
 * Schedule a notification for an upcoming recurring transaction
 */
export const scheduleTransactionNotification = async (
  transaction: RecurringTransaction,
  dueDate: Date
): Promise<string | null> => {
  try {
    // Check if notifications are enabled
    const isEnabled = await areNotificationsEnabled();
    if (!isEnabled) {
      return null;
    }

    // Check if we've already scheduled this notification
    const scheduledNotifications = await getScheduledNotifications();
    if (scheduledNotifications[transaction.id]) {
      // Already scheduled, don't schedule again
      return null;
    }

    // Calculate notification time (24 hours before due date)
    const notificationDate = new Date(dueDate);
    notificationDate.setDate(notificationDate.getDate() - 1);

    // Don't schedule if the notification time is in the past
    if (notificationDate < new Date()) {
      return null;
    }

    // Format transaction amount
    const amount = formatCurrency(transaction.amount);

    // Create notification content
    const content = {
      title: transaction.isIncome ? 'Upcoming Income' : 'Upcoming Expense',
      body: `${transaction.note || 'Recurring transaction'} - ${amount} due tomorrow`,
      data: { transactionId: transaction.id },
      sound: true,
    };

    // Get a unique identifier for this notification
    const identifier = getNotificationIdentifier(transaction.id);

    // Cancel any existing notification for this transaction
    await cancelTransactionNotification(transaction.id);

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        date: notificationDate,
        channelId: Platform.OS === 'android' ? 'recurring-transactions' : undefined,
      },
      identifier,
    });

    // Mark this notification as scheduled
    await markNotificationScheduled(transaction.id);

    return notificationId;
  } catch (error) {
    console.error('Error scheduling transaction notification:', error);
    return null;
  }
};

/**
 * Cancel a scheduled notification for a transaction
 */
export const cancelTransactionNotification = async (transactionId: string): Promise<void> => {
  try {
    const identifier = getNotificationIdentifier(transactionId);
    await Notifications.cancelScheduledNotificationAsync(identifier);

    // Clear the scheduled notification marker
    await clearScheduledNotification(transactionId);
  } catch (error) {
    console.error('Error canceling transaction notification:', error);
  }
};

/**
 * Check for upcoming transactions and schedule notifications
 */
export const checkAndScheduleNotifications = async (
  transactions: RecurringTransaction[]
): Promise<void> => {
  try {
    // Check if notifications are enabled
    const isEnabled = await areNotificationsEnabled();
    if (!isEnabled) {
      return;
    }

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    // Look for transactions with nextDue dates in the near future
    for (const transaction of transactions) {
      if (!transaction.active || !transaction.nextDue) {
        continue;
      }

      const dueDate = new Date(transaction.nextDue);

      // Only schedule if due date is within the next 30 days
      if (dueDate >= now && dueDate <= thirtyDaysFromNow) {
        await scheduleTransactionNotification(transaction, dueDate);
      }
    }
  } catch (error) {
    console.error('Error checking and scheduling notifications:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
};

const getScheduledNotifications = async (): Promise<Record<string, boolean>> => {
  try {
    const value = await AsyncStorage.getItem(SCHEDULED_NOTIFICATIONS_KEY);
    return value ? JSON.parse(value) : {};
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return {};
  }
};

const markNotificationScheduled = async (transactionId: string): Promise<void> => {
  try {
    const scheduled = await getScheduledNotifications();
    scheduled[transactionId] = true;
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduled));
  } catch (error) {
    console.error('Error marking notification as scheduled:', error);
  }
};

const clearScheduledNotification = async (transactionId: string): Promise<void> => {
  try {
    const scheduled = await getScheduledNotifications();
    delete scheduled[transactionId];
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduled));
  } catch (error) {
    console.error('Error clearing scheduled notification:', error);
  }
};

export default {
  registerForPushNotificationsAsync,
  areNotificationsEnabled,
  setNotificationsEnabled,
  scheduleTransactionNotification,
  cancelTransactionNotification,
  checkAndScheduleNotifications,
  cancelAllNotifications,
};