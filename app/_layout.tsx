import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen, Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text, StyleSheet } from 'react-native';

import { ExpensesProvider } from './contexts/ExpensesContext';
import { PeriodProvider } from './contexts/PeriodContext';
import { initDatabase } from './database/database';
import { BudgetProvider } from './contexts/BudgetContext';
import { CurrencyProvider } from './contexts/CurrencyContext';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // If you want to add custom fonts, add them here
  });
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

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
          <ExpensesProvider>
            <StatusBar style="light" />
            <Slot />
          </ExpensesProvider>
        </BudgetProvider>
      </PeriodProvider>
    </CurrencyProvider>
  );
}