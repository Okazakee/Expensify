import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen, Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text, StyleSheet } from 'react-native';

import { TransactionsProvider } from './contexts/TransactionsContext';
import { PeriodProvider } from './contexts/PeriodContext';
import { initDatabase } from './database/database';
import { BudgetProvider } from './contexts/BudgetContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { RecurringTransactionsProvider } from './contexts/RecurringTransactionsContext';
import BiometricAuthScreen from './components/BiometricAuthScreen';
import biometricUtils from './utils/biometricUtils';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // If you want to add custom fonts, add them here
  });
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showBiometricAuth, setShowBiometricAuth] = useState(true);
  const [biometricCheckComplete, setBiometricCheckComplete] = useState(false);

  const handleBiometricSuccess = () => {
    setShowBiometricAuth(false);
    setBiometricCheckComplete(true);
  };

  useEffect(() => {
    const checkBiometricSettings = async () => {
      try {
        const available = await biometricUtils.isBiometricAvailable();
        const enabled = available ? await biometricUtils.isBiometricEnabled() : false;

        // Only show the auth screen if biometrics are available and enabled
        setShowBiometricAuth(available && enabled);

        // If biometrics aren't enabled, mark the check as complete
        if (!available || !enabled) {
          setBiometricCheckComplete(true);
        }
      } catch (error) {
        console.error('Error checking biometric settings:', error);
        setShowBiometricAuth(false);
        setBiometricCheckComplete(true);
      }
    };

    checkBiometricSettings();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize the database
        await initDatabase();
        setIsDbInitialized(true);
      } catch (error) {
        console.error('Error initializing the app:', error);
        setInitError('Failed to initialize database');
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isDbInitialized) {
      // Hide the splash screen once everything is loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isDbInitialized]);

  if (!fontsLoaded || !isDbInitialized) {
    return null;
  }

  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <Text style={{ color: '#ffffff', fontSize: 16 }}>
          {initError}. Please restart the app.
        </Text>
      </View>
    );
  }

  return (
    <CurrencyProvider>
      <PeriodProvider>
        <BudgetProvider>
          <TransactionsProvider>
            <RecurringTransactionsProvider>
              <StatusBar style="light" />
              <Slot />
              {showBiometricAuth && (
                <BiometricAuthScreen
                  onSuccess={handleBiometricSuccess}
                />
              )}
            </RecurringTransactionsProvider>
          </TransactionsProvider>
        </BudgetProvider>
      </PeriodProvider>
    </CurrencyProvider>
  )
};