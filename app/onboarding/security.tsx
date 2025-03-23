import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Image,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as biometricUtils from '../utils/biometricUtils';
import { setOnboardingCompleted } from '../utils/onboardingUtils';
import * as Haptics from 'expo-haptics';
import { useCurrency, AVAILABLE_CURRENCIES } from '../contexts/CurrencyContext';
import type { Currency } from '../contexts/CurrencyContext';

export default function SecurityScreen() {
  const router = useRouter();
  const { currentCurrency, setCurrency } = useCurrency();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

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

  const toggleBiometricAuth = async (value: boolean) => {
    // Haptic feedback for switch toggle
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      .catch(error => console.log('Haptics not supported', error));

    if (value && biometricAvailable) {
      // Try to authenticate to make sure it works
      const success = await biometricUtils.authenticateWithBiometrics(
        `Authenticate with ${biometricType} to enable authentication`
      );

      if (success) {
        await biometricUtils.setBiometricEnabled(value);
        setBiometricEnabled(value);

        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
          .catch(error => console.log('Haptics not supported', error));
      } else {
        // If authentication fails, keep the switch off
        setBiometricEnabled(false);

        // Error haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
          .catch(error => console.log('Haptics not supported', error));
      }
    } else {
      // When disabling, no need to authenticate first
      await biometricUtils.setBiometricEnabled(value);
      setBiometricEnabled(value);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // Add haptic feedback for completion
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        .catch(error => console.log('Haptics not supported', error));

      // Mark onboarding as completed
      await setOnboardingCompleted();

      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsLoading(false);
    }
  };

  const handleOpenCurrencySelector = () => {
    setShowCurrencyModal(true);
  };

  const handleSelectCurrency = async (currency: Currency) => {
    try {
      await setCurrency(currency);
      setShowCurrencyModal(false);

      // Haptic feedback for selection
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        .catch(error => console.log('Haptics not supported', error));
    } catch (error) {
      console.error('Error setting currency:', error);
    }
  };

  const renderCurrencyItem = ({ item }: { item: Currency }) => {
    const isSelected = currentCurrency.code === item.code;

    return (
      <TouchableOpacity
        style={[styles.currencyItem, isSelected && styles.selectedCurrencyItem]}
        onPress={() => handleSelectCurrency(item)}
      >
        <View style={styles.currencyInfo}>
          <Text style={styles.currencySymbol}>{item.symbol}</Text>
          <View style={styles.currencyTextContainer}>
            <Text style={styles.currencyName}>{item.name}</Text>
            <Text style={styles.currencyCode}>{item.code}</Text>
          </View>
        </View>

        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color="#50E3C2" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Almost Done!</Text>
        <Text style={styles.subtitle}>
          Set up your preferences to customize your experience. You can always change these later in settings.
        </Text>

        <View style={styles.optionsContainer}>
          {/* Currency Selection Option */}
          <View style={styles.securityOption}>
            <View style={styles.optionTextContainer}>
              <Text style={styles.optionTitle}>Preferred Currency</Text>
              <Text style={styles.optionDescription}>
                Select the currency you want to use for tracking expenses
              </Text>
            </View>

            <TouchableOpacity
              style={styles.currencySelector}
              onPress={handleOpenCurrencySelector}
            >
              <Text style={styles.currencyButtonText}>
                {currentCurrency.code}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#FFFFFF" style={styles.currencyIcon} />
            </TouchableOpacity>
          </View>

          {/* Biometric Authentication Option */}
          {biometricAvailable ? (
            <View style={styles.securityOption}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>{biometricType} Authentication</Text>
                <Text style={styles.optionDescription}>
                  Require {biometricType.toLowerCase()} authentication to access the app
                </Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometricAuth}
                trackColor={{ false: '#3e3e3e', true: 'rgba(80, 171, 227, 0.3)' }}
                thumbColor={biometricEnabled ? '#15E8FE' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          ) : (
            <View style={styles.securityOption}>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Biometric Authentication</Text>
                <Text style={styles.optionDescription}>
                  Biometric authentication is not available on this device
                </Text>
              </View>
              <Switch
                value={false}
                disabled={true}
                trackColor={{ false: '#3e3e3e', true: 'rgba(80, 171, 227, 0.3)' }}
                thumbColor="#f4f3f4"
                ios_backgroundColor="#3e3e3e"
              />
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleComplete}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Setting Up...' : 'Complete Setup'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Currency Selector Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={AVAILABLE_CURRENCIES}
              renderItem={renderCurrencyItem}
              keyExtractor={item => item.code}
              contentContainerStyle={styles.currencyList}
            />
          </View>
        </View>
      </Modal>
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
    padding: 24,
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: 32,
  },
  illustration: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  optionsContainer: {
    width: '100%',
  },
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(21, 232, 254, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  currencyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  currencyIcon: {
    marginLeft: 5,
  },
  footer: {
    width: '100%',
    padding: 24,
    paddingBottom: 36,
  },
  button: {
    backgroundColor: '#15E8FE',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#15E8FE',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  currencyList: {
    padding: 8,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCurrencyItem: {
    backgroundColor: 'rgba(80, 227, 194, 0.1)',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 30,
    textAlign: 'center',
  },
  currencyTextContainer: {
    marginLeft: 12,
  },
  currencyName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});