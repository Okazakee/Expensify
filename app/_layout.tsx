import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen, useRouter, Slot } from 'expo-router';
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
import { isOnboardingCompleted } from './utils/onboardingUtils';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    // If you want to add custom fonts, add them here
  });
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [showBiometricAuth, setShowBiometricAuth] = useState(false);
  const [biometricCheckComplete, setBiometricCheckComplete] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const handleBiometricSuccess = () => {
    setShowBiometricAuth(false);
    setBiometricCheckComplete(true);
  };

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await isOnboardingCompleted();
        setHasCompletedOnboarding(completed);
        setOnboardingChecked(true);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasCompletedOnboarding(false);
        setOnboardingChecked(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (onboardingChecked && !hasCompletedOnboarding && isDbInitialized && fontsLoaded) {
      // Hide splash screen before redirecting
      SplashScreen.hideAsync().catch(() => {});

      // Use a timeout to ensure the splash screen has a chance to hide
      const timer = setTimeout(() => {
        router.replace('/onboarding');
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [onboardingChecked, hasCompletedOnboarding, isDbInitialized, fontsLoaded, router]);

  useEffect(() => {
    const checkBiometricSettings = async () => {
      try {
        const available = await biometricUtils.isBiometricAvailable();
        const enabled = available ? await biometricUtils.isBiometricEnabled() : false;

        // Only show the auth screen if biometrics are available, enabled, and onboarding is completed
        setShowBiometricAuth(available && enabled && hasCompletedOnboarding);

        // If biometrics aren't enabled, mark the check as complete
        if (!available || !enabled || !hasCompletedOnboarding) {
          setBiometricCheckComplete(true);
        }
      } catch (error) {
        console.error('Error checking biometric settings:', error);
        setShowBiometricAuth(false);
        setBiometricCheckComplete(true);
      }
    };

    if (onboardingChecked) {
      checkBiometricSettings();
    }
  }, [onboardingChecked, hasCompletedOnboarding]);

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
    if (
      fontsLoaded &&
      isDbInitialized &&
      onboardingChecked &&
      (hasCompletedOnboarding ? biometricCheckComplete : true)
    ) {
      // Hide the splash screen once everything is loaded
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, isDbInitialized, onboardingChecked, hasCompletedOnboarding, biometricCheckComplete]);

  if (!fontsLoaded || !isDbInitialized || !onboardingChecked) {
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
  );
};