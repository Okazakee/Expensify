import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen, Tabs } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { ExpensesProvider } from './contexts/ExpensesContext';
import { initDatabase } from './database/database';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

//TODO fix later any

const TabBarIcon = ({ name, color }: { name: any; color: string }) => {
  return <Ionicons name={name} size={24} color={color} />;
};

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
    <ExpensesProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
          ),
          tabBarActiveTintColor: '#50E3C2',
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: 'Expenses',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
        <Tabs.Screen
          name="add-expense"
          options={{
            title: 'Add',
            tabBarIcon: ({ color }) => (
              <View style={styles.addButtonContainer}>
                <Ionicons name="add-circle" size={50} color="#50E3C2" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: 'Reports',
            tabBarIcon: ({ color }) => <TabBarIcon name="pie-chart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
          }}
        />
      </Tabs>
    </ExpensesProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    backgroundColor: 'rgba(18, 18, 18, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    height: 80,
    paddingBottom: 20,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButtonContainer: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});