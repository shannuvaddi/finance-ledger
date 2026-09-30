import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { useChartColors } from '../../constants/chartColors';
import { cardShadow } from '../../constants/gradients';

export interface Delta {
  text: string;            // e.g. "12% vs Sep"
  direction: 'up' | 'down' | 'flat';
  good: boolean | null;    // whether this direction is good news; null = neutral
}

interface StatTileProps {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  delta?: Delta | null;
  style?: ViewStyle;
}

/** KPI tile: label, value, and a signed delta vs the previous period (icon + text, never color alone). */
export function StatTile({ label, value, icon, delta, style }: StatTileProps) {
  const theme = useTheme();
  const colors = useChartColors();
  const deltaColor = delta?.good == null ? theme.muted : delta.good ? colors.good : colors.critical;
  const arrow = delta?.direction === 'up' ? 'arrow-up' : delta?.direction === 'down' ? 'arrow-down' : 'remove';

  return (
    <View style={[styles.tile, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={14} color={theme.muted} />
        <Text style={[styles.label, { color: theme.textSecondary }]} numberOfLines={1}>{label}</Text>
      </View>
      <Text style={[styles.value, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      {delta ? (
        <View style={styles.deltaRow}>
          <Ionicons name={arrow} size={12} color={deltaColor} />
          <Text style={[styles.delta, { color: deltaColor }]} numberOfLines={1}>{delta.text}</Text>
        </View>
      ) : (
        <Text style={[styles.delta, { color: theme.muted }]}> </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { borderWidth: 1, borderRadius: 16, padding: 14, flex: 1, minWidth: 0 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '500', flexShrink: 1 },
  value: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  delta: { fontSize: 12, fontWeight: '600', marginTop: 4 },
});
