import type React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Context and utilities
import { useCurrency } from '../contexts/CurrencyContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useRecurringTransactions } from '../contexts/RecurringTransactionsContext';
import { usePeriod } from '../contexts/PeriodContext';
import { useBiometricAuth } from '../hooks/useBiometricAuth';
import * as biometricUtils from '../utils/biometricUtils';
import { resetDatabase } from '../database/database';
import { resetAsyncStorage } from '../utils/storageUtils';
import CurrencySelector from '../components/CurrencySelector';

// Components
const SettingsScreen = () => {
  // Context hooks
  const { currentCurrency } = useCurrency();
  const { refreshData } = useTransactions();
  const { refreshTransactions } = useRecurringTransactions();
  const { resetToCurrentMonth } = usePeriod();
  const { authenticate } = useBiometricAuth();

  // State variables
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  // Check biometric availability
  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const available = await biometricUtils.isBiometricAvailable();
        setBiometricAvailable(available);

        if (available) {
          const type = await biometricUtils.getBiometricType();
          setBiometricType(type);

          const enabled = await biometricUtils.isBiometricEnabled();
          setBiometricEnabled(enabled);
        }
      } catch (error) {
        console.error('Error checking biometrics:', error);
      }
    };

    checkBiometrics();
  }, []);

  // Helper function to refresh all app data
  const refreshAppData = async () => {
    try {
      // Reset to current month
      resetToCurrentMonth();

      // Refresh transactions data
      await refreshData();

      // Refresh recurring transactions
      await refreshTransactions();
    } catch (error) {
      console.error('Error refreshing app data:', error);
    }
  };

  const toggleDarkMode = () => {
    // In a real app, we would handle theme switching here
    // For this hackathon, we're keeping it dark theme only
    Alert.alert(
      "Dark Mode Only",
      "This app is designed with a dark theme for the retrofuturism aesthetic. Light mode is not available in this version.",
      [{ text: "OK" }]
    );
  };

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  const handleExportData = () => {
    Alert.alert(
      "Export Data",
      "This feature would export your expense data in CSV format. Not implemented for the hackathon.",
      [{ text: "OK" }]
    );
  };

  const handleCurrencySelection = () => {
    setShowCurrencySelector(true);
  };

  const handleImportData = () => {
    Alert.alert(
      "Import Data",
      "This feature would allow importing expense data from CSV. Not implemented for the hackathon.",
      [{ text: "OK" }]
    );
  };

  const handleResetData = async () => {
    Alert.alert(
      "Reset All Data",
      "This will delete all your expenses and categories. This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            // First authenticate with biometrics if available and enabled
            await authenticate(
              "Authenticate to reset all data",
              async () => {
                // This code runs after successful authentication
                try {
                  // Show loading indicator
                  setIsResetting(true);

                  // Reset database
                  await resetDatabase();

                  // Reset AsyncStorage but preserve biometric settings
                  await resetAsyncStorage(['@expensify_biometric_enabled']);

                  // Refresh all app data
                  await refreshAppData();

                  // Hide loading indicator
                  setIsResetting(false);

                  // Show success message
                  Alert.alert(
                    "Data Reset",
                    "All transactions, budgets, and settings have been reset successfully."
                  );
                } catch (error) {
                  console.error('Error resetting data:', error);
                  setIsResetting(false);
                  Alert.alert(
                    "Reset Failed",
                    "There was an error resetting your data. Please try again."
                  );
                }
              },
              () => {
                // This runs if authentication fails
                Alert.alert(
                  "Authentication Failed",
                  "For your security, data reset requires authentication."
                );
              }
            );
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "About Expensify",
      "Version 1.0.0\n\nA simple yet powerful expense tracking app created for the 24-hour hack.bs hackathon. Built with React Native and Expo.",
      [{ text: "OK" }]
    );
  };

  // Add biometric toggle function
  const toggleBiometricAuth = async (value: boolean) => {
    if (value && biometricAvailable) {
      // Verify with biometrics before enabling
      const success = await biometricUtils.authenticateWithBiometrics(
        `Authenticate to ${value ? 'enable' : 'disable'} ${biometricType} authentication`
      );

      if (success) {
        await biometricUtils.setBiometricEnabled(value);
        setBiometricEnabled(value);
      } else {
        // If authentication fails, revert the switch
        setBiometricEnabled(!value);
      }
    } else {
      // When disabling, no need to authenticate first
      await biometricUtils.setBiometricEnabled(value);
      setBiometricEnabled(value);
    }
  };

  const renderSettingsItem = (
    icon: string,
    title: string,
    onPress: () => void,
    rightElement?: React.ReactNode
  ) => {
    /* TODO fix type later */
    return (
      <TouchableOpacity style={styles.settingItem} onPress={onPress}>
        <View style={styles.settingLeft}>
          {/* biome-ignore lint/suspicious/noExplicitAny: <explanation> */}
          <Ionicons name={icon as any} size={22} color="#15E8FE" style={styles.settingIcon} />
          <Text style={styles.settingTitle}>{title}</Text>
        </View>
        {rightElement ? (
          rightElement
        ) : (
          <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>App Settings</Text>
      </View>

      {/* Wrap the content in a ScrollView */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderSettingsItem(
            'moon',
            'Dark Mode',
            toggleDarkMode,
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#3e3e3e', true: 'rgba(80, 171, 227, 0.3)' }}
              thumbColor={darkMode ? '#15E8FE' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          )}
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {renderSettingsItem(
            'notifications',
            'Notifications',
            toggleNotifications,
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#3e3e3e', true: 'rgba(80, 171, 227, 0.3)' }}
              thumbColor={darkMode ? '#15E8FE' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          )}
          {renderSettingsItem(
            'cash-outline',
            'Currency',
            handleCurrencySelection,
            <View style={styles.currencyValue}>
              <Text style={styles.currencySymbol}>{currentCurrency.symbol}</Text>
              <Text style={styles.currencyCode}>{currentCurrency.code}</Text>
            </View>
          )}
        </View>

        {/* Security Section with Biometrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>

          {biometricAvailable ? (
            renderSettingsItem(
              biometricType === 'Face ID' ? 'scan-face' : 'finger-print',
              `${biometricType} Authentication`,
              () => toggleBiometricAuth(!biometricEnabled),
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometricAuth}
                trackColor={{ false: '#3e3e3e', true: 'rgba(80, 171, 227, 0.3)' }}
                thumbColor={biometricEnabled ? '#15E8FE' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            )
          ) : (
            renderSettingsItem(
              'lock-closed',
              'Biometric Authentication',
              () => Alert.alert('Not Available', 'Biometric authentication is not available on this device.'),
              <Text style={styles.settingUnavailableText}>Unavailable</Text>
            )
          )}

          {renderSettingsItem(
            'shield-checkmark',
            'Privacy Policy',
            () => Alert.alert('Privacy Policy', 'View our privacy policy and data handling practices.'),
          )}

          {renderSettingsItem(
            'document-text',
            'Terms of Service',
            () => Alert.alert('Terms of Service', 'View our terms of service.'),
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          {renderSettingsItem('download-outline', 'Export Data', handleExportData)}
          {renderSettingsItem('cloud-upload-outline', 'Import Data', handleImportData)}
          {renderSettingsItem(
            'trash-outline',
            'Reset All Data',
            handleResetData,
            isResetting ? (
              <ActivityIndicator size="small" color="#FF6B6B" />
            ) : undefined
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingsItem('information-circle-outline', 'About Expensify', handleAbout)}
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      <CurrencySelector
        isVisible={showCurrencySelector}
        onClose={() => setShowCurrencySelector(false)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60, // Adjust this if needed based on your app's status bar
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15E8FE',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  currencyValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#15E8FE',
    marginRight: 4,
  },
  currencyCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  versionText: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 24,
    marginBottom: 64
  },
  settingUnavailableText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;