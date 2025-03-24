import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerStyle: {
            backgroundColor: '#1A1A1A',
          },
          headerTintColor: '#FFFFFF',
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.date}>Last Updated: March 23, 2025</Text>

        <Text style={styles.heading}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to Expensify ("we," "our," or "us"). This Privacy Policy explains how we collect, use, store, protect, and share your personal information when you use our mobile application ("App").
        </Text>
        <Text style={styles.paragraph}>
          We are committed to protecting your privacy and ensuring you have a positive experience using our App. This Privacy Policy complies with the General Data Protection Regulation (GDPR) and other applicable privacy laws.
        </Text>

        <Text style={styles.heading}>2. Information We Collect</Text>
        <Text style={styles.subheading}>Personal Information</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Authentication Data:</Text> If you enable biometric authentication, we use your device's biometric information (fingerprint or facial recognition) through the operating system's secure APIs. We never directly access, store, or process your actual biometric data.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>User Preferences:</Text> Currency preferences, notification settings, and other app configurations.
        </Text>

        <Text style={styles.subheading}>Financial Data</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Transaction Data:</Text> Information about your expenses and income, including amounts, dates, categories, and any notes you add.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Budget Information:</Text> Monthly budget amounts you set within the app.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Recurring Transactions:</Text> Information about periodic expenses or income you configure.
        </Text>

        <Text style={styles.subheading}>Technical Information</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Device Information:</Text> Operating system version, device model, and other technical identifiers necessary for the app to function.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>App Usage Data:</Text> Information about how you use the app, such as features used and user interactions.
        </Text>

        <Text style={styles.heading}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>We use your information for the following purposes:</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>To Provide Our Services:</Text> Processing and storing your financial data to deliver the core functionality of the app.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>To Personalize Your Experience:</Text> Customizing the app based on your preferences and usage patterns.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>To Send Notifications:</Text> Sending reminders about recurring transactions or budget limits when you enable notifications.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>To Improve Our Services:</Text> Analyzing usage patterns to enhance app features and functionality.
        </Text>

        <Text style={styles.heading}>4. Data Storage and Security</Text>
        <Text style={styles.subheading}>Local Storage</Text>
        <Text style={styles.paragraph}>
          All your data is stored locally on your device using SQLite database encryption. We employ the following security measures:
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Local Processing:</Text> All data processing happens directly on your device.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>No Remote Servers:</Text> We do not transmit your financial data to any remote servers.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Optional Biometric Security:</Text> You can enable biometric authentication (Face ID/Fingerprint) for additional security.
        </Text>

        <Text style={styles.subheading}>Backups and Exports</Text>
        <Text style={styles.paragraph}>When you choose to export your data:</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Local Exports:</Text> Data exports are saved to your device's storage.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Sharing:</Text> You control who you share exported data with through your device's sharing features.
        </Text>

        <Text style={styles.heading}>5. Your Data Protection Rights</Text>
        <Text style={styles.paragraph}>
          Under the GDPR and similar regulations, you have the following rights:
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Right to Access:</Text> You can access all your data directly in the app.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Right to Rectification:</Text> You can edit or update your information at any time.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Right to Erasure:</Text> You can delete your data using the app's "Reset All Data" function in Settings.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Right to Restriction of Processing:</Text> Since all processing is local to your device, you control all processing.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Right to Data Portability:</Text> You can export your data in CSV or JSON format from the app.
        </Text>

        <Text style={styles.heading}>6. Third-Party Integration</Text>
        <Text style={styles.paragraph}>Our app uses the following third-party services:</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Expo Notifications:</Text> For scheduling and displaying local notifications about recurring transactions.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Expo Local Authentication:</Text> For providing biometric authentication features.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Expo File System:</Text> For managing data exports and imports.
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>Expo Document Picker:</Text> For selecting files during data import.
        </Text>
        <Text style={styles.paragraph}>
          These services operate within your device and do not transmit your financial data to external servers.
        </Text>

        <Text style={styles.heading}>7. Analytics and Tracking</Text>
        <Text style={styles.paragraph}>
          Our app does not include any third-party analytics or tracking tools. We do not collect usage statistics or user behavior information beyond your device.
        </Text>

        <Text style={styles.heading}>8. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our App is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
        </Text>

        <Text style={styles.heading}>9. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </Text>

        <Text style={styles.heading}>10. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions about this Privacy Policy, please contact us at:
        </Text>
        <Text style={styles.contactInfo}>privacy@expensify-app.example</Text>

        <Text style={styles.footer}>
          By using our App, you agree to the collection and use of information in accordance with this Privacy Policy.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    marginTop: 20,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15E8FE',
    marginTop: 24,
    marginBottom: 12,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactInfo: {
    fontSize: 14,
    color: '#15E8FE',
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 24,
    marginBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});