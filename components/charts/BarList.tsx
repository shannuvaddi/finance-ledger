import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { useChartColors } from '../../constants/chartColors';
import { categoryLabel, categoryMeta } from '../../constants/categories';
import { formatKr } from '../../constants/format';
import { CategoryInsight } from '../../hooks/useInsights';

const VISIBLE = 6;

/**
 * Horizontal bars for category spend. One series, so every bar is the same color; the
 * category's icon carries identity and the value sits at the bar tip in text ink.
 */
export function BarList({ items }: { items: CategoryInsight[] }) {
  const theme = useTheme();
  const colors = useChartColors();
  const [expanded, setExpanded] = useState(false);
  const rows = items.filter((c) => c.spent > 0 || c.previousSpent > 0);
  const shown = expanded ? rows : rows.slice(0, VISIBLE);
  const max = Math.max(1, ...rows.map((r) => r.spent));

  return (
    <View style={styles.list}>
      {shown.map((c) => {
        const meta = categoryMeta(c.category);
        const change = c.previousSpent > 0 ? (c.spent - c.previousSpent) / c.previousSpent : null;
        const over = c.budget != null && c.spent > c.budget;
        return (
          <View key={c.category} style={styles.row} accessibilityLabel={`${c.category}: ${formatKr(c.spent)}, ${c.share}% of spending`}>
            <View style={[styles.icon, { backgroundColor: meta.color + '1F' }]}>
              <Ionicons name={meta.icon} size={14} color={meta.color} />
            </View>
            <View style={styles.body}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.text }]}>{categoryLabel(c.category)}</Text>
                <Text style={[styles.meta, { color: theme.muted }]}>
                  {c.share}%
                  {change != null && Math.abs(change) >= 0.01
                    ? `  ·  ${change > 0 ? '↑' : '↓'} ${Math.round(Math.abs(change) * 100)}% vs last`
                    : ''}
                  {over ? '  ·  over budget' : ''}
                </Text>
              </View>
              <View style={styles.barRow}>
                <View
                  style={[
                    styles.bar,
                    { width: `${(c.spent / max) * 100}%`, backgroundColor: colors.expense, minWidth: c.spent > 0 ? 4 : 0 },
                  ]}
                />
                <Text style={[styles.value, { color: theme.text }]}>{formatKr(c.spent)}</Text>
              </View>
            </View>
          </View>
        );
      })}
      {rows.length > VISIBLE && (
        <TouchableOpacity onPress={() => setExpanded((v) => !v)} style={styles.more}>
          <Text style={[styles.moreText, { color: theme.accent }]}>
            {expanded ? 'Show less' : `Show ${rows.length - VISIBLE} more`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  meta: { fontSize: 11 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: 70 },
  bar: { height: 10, borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  value: { fontSize: 12, fontWeight: '700', position: 'absolute', right: 0, fontVariant: ['tabular-nums'] },
  more: { alignSelf: 'center', paddingVertical: 4 },
  moreText: { fontSize: 13, fontWeight: '600' },
});
