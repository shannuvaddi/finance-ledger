import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { usePeriod } from '../../context/PeriodContext';
import { periodLabel } from '../../constants/period';

/**
 * The global period selector shown at the top of every tab. Chevrons move the selected
 * period back/forward one cycle; the label reads e.g. "August 2026".
 */
export function PeriodHeader() {
  const theme = useTheme();
  const { period, next, prev } = usePeriod();

  return (
    <View style={[styles.bar, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <TouchableOpacity onPress={prev} hitSlop={10} style={styles.arrow} activeOpacity={0.6}>
        <Ionicons name="chevron-back" size={20} color={theme.accent} />
      </TouchableOpacity>
      <View style={styles.labelWrap}>
        <Ionicons name="calendar-outline" size={15} color={theme.muted} />
        <Text style={[styles.label, { color: theme.text }]}>{periodLabel(period)}</Text>
      </View>
      <TouchableOpacity onPress={next} hitSlop={10} style={styles.arrow} activeOpacity={0.6}>
        <Ionicons name="chevron-forward" size={20} color={theme.accent} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  arrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  labelWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 15, fontWeight: '700' },
});
