import type React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCurrency } from '../contexts/CurrencyContext';
import CurrencySelector from '../components/CurrencySelector';

const SettingsScreen = () => {
  const { currentCurrency } = useCurrency();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

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

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will delete all your expenses and categories. This action cannot be undone. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            // In a real app, we would call a function to clear the database
            Alert.alert("Data Reset", "All data has been reset.");
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "About Expensify",
      "Version 1.0.0\n\nA simple yet powerful expense tracking app created for the 24-hour hackathon. Built with React Native and Expo.",
      [{ text: "OK" }]
    );
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

      <View style={styles.content}>
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

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          {renderSettingsItem('download-outline', 'Export Data', handleExportData)}
          {renderSettingsItem('cloud-upload-outline', 'Import Data', handleImportData)}
          {renderSettingsItem('trash-outline', 'Reset All Data', handleResetData)}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          {renderSettingsItem('information-circle-outline', 'About Expensify', handleAbout)}
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

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
    paddingTop: 60,
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
    marginBottom: 16,
  },
});

export default SettingsScreen;