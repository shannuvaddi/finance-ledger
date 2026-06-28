import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PinInput } from '../components/ui/PinInput';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useThemeColor';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [error, setError] = useState('');

  const handleSubmit = (pin: string) => {
    if (login(pin)) {
      router.replace('/(tabs)');
    } else {
      setError('Incorrect PIN');
      setTimeout(() => setError(''), 2000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PinInput onSubmit={handleSubmit} error={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
