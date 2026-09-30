import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useThemeColor';

export interface Segment {
  label: string;
  value: number;
  color: string;
}

/** Part-to-whole bar with a 2px surface gap between segments; the legend carries every value. */
export function StackedBar({ segments, formatValue }: { segments: Segment[]; formatValue: (v: number) => string }) {
  const theme = useTheme();
  const total = segments.reduce((s, x) => s + x.value, 0);
  const visible = segments.filter((s) => s.value > 0);

  return (
    <View>
      <View style={[styles.bar, { backgroundColor: theme.card }]}>
        {total === 0 ? (
          <View style={[styles.empty, { backgroundColor: theme.border }]} />
        ) : (
          visible.map((s, i) => (
            <View
              key={s.label}
              style={{
                flex: s.value,
                backgroundColor: s.color,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === visible.length - 1 ? 4 : 0,
                borderBottomRightRadius: i === visible.length - 1 ? 4 : 0,
              }}
            />
          ))
        )}
      </View>
      <View style={styles.legend}>
        {segments.map((s) => (
          <View key={s.label} style={styles.item}>
            <View style={[styles.key, { backgroundColor: s.color }]} />
            <Text style={[styles.label, { color: theme.textSecondary }]}>{s.label}</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatValue(s.value)}
              {total > 0 ? ` · ${Math.round((s.value / total) * 100)}%` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', height: 14, gap: 2 },
  empty: { flex: 1, borderRadius: 4 },
  legend: { marginTop: 12, gap: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  key: { width: 10, height: 10, borderRadius: 3 },
  label: { fontSize: 13, flex: 1 },
  value: { fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
});
