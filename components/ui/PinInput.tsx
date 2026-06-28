import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useThemeColor';

interface PinInputProps {
  onSubmit: (pin: string) => void;
  error?: string;
}

export function PinInput({ onSubmit, error }: PinInputProps) {
  const [pin, setPin] = useState('');
  const theme = useTheme();

  const handlePress = (digit: string) => {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) onSubmit(next);
    }
  };

  const handleDelete = () => setPin((p) => p.slice(0, -1));

  const dots = Array.from({ length: 4 }, (_, i) => (
    <View
      key={i}
      style={[
        styles.dot,
        { borderColor: theme.muted },
        i < pin.length && { backgroundColor: theme.accent, borderColor: theme.accent },
      ]}
    />
  ));

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <View style={styles.container}>
      <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back</Text>
      <Text style={[styles.title, { color: theme.text }]}>Chanakya</Text>
      <View style={styles.dotsRow}>{dots}</View>
      {error ? (
        <Text style={[styles.error, { color: theme.danger }]}>{error}</Text>
      ) : (
        <Text style={[styles.hint, { color: theme.muted }]}>Enter your PIN to continue</Text>
      )}
      <View style={styles.grid}>
        {digits.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.key,
              { backgroundColor: d ? theme.card : 'transparent', borderColor: d ? theme.border : 'transparent', borderWidth: 1 },
            ]}
            onPress={() => {
              if (d === '⌫') handleDelete();
              else if (d) handlePress(d);
            }}
            disabled={!d}
            activeOpacity={0.6}
          >
            <Text style={[styles.keyText, { color: theme.text }]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 60 },
  greeting: { fontSize: 15, marginBottom: 4 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 40, letterSpacing: -0.5 },
  dotsRow: { flexDirection: 'row', gap: 18, marginBottom: 16 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  error: { fontSize: 13, marginBottom: 12 },
  hint: { fontSize: 13, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 270, justifyContent: 'center', gap: 14, marginTop: 28 },
  key: { width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' },
  keyText: { fontSize: 26, fontWeight: '500' },
});
