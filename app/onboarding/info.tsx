import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function InfoScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/onboarding/security');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How It Works</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="card-outline" size={32} color="#15E8FE" />
          </View>
          <Text style={styles.sectionTitle}>Add Your Transactions</Text>
          <Text style={styles.sectionDescription}>
            Track your daily expenses and income with just a few taps. Categorize them to better understand your spending habits.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="repeat-outline" size={32} color="#15E8FE" />
          </View>
          <Text style={styles.sectionTitle}>Recurring Transactions</Text>
          <Text style={styles.sectionDescription}>
            Set up recurring expenses and income like rent, salary, or subscriptions to automatically track them every month.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="wallet-outline" size={32} color="#15E8FE" />
          </View>
          <Text style={styles.sectionTitle}>Monthly Budget</Text>
          <Text style={styles.sectionDescription}>
            Set a monthly budget to help you stay on track with your financial goals. Get notified when you're close to your limit.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconContainer}>
            <Ionicons name="pie-chart-outline" size={32} color="#15E8FE" />
          </View>
          <Text style={styles.sectionTitle}>Insightful Reports</Text>
          <Text style={styles.sectionDescription}>
            Visualize your spending patterns through customized reports. Understand where your money goes with beautiful charts.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 12,
  },
  section: {
    marginBottom: 32,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(21, 232, 254, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    padding: 24,
    paddingBottom: 36,
  },
  button: {
    backgroundColor: '#15E8FE',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});