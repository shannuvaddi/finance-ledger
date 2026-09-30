import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { cardShadow } from '../../constants/gradients';

export interface LegendItem {
  label: string;
  color: string;
  kind?: 'rect' | 'line'; // mirrors the mark: rect for bars, line for lines
}

export interface TableData {
  columns: string[];
  rows: string[][];
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  legend?: LegendItem[];
  /** Table twin of the chart; adds a chart/table toggle to the header. */
  table?: TableData;
  style?: ViewStyle;
  children: React.ReactNode;
}

/** Card chrome shared by every dashboard chart: title, legend, and an optional table view. */
export function ChartCard({ title, subtitle, legend, table, style, children }: ChartCardProps) {
  const theme = useTheme();
  const [showTable, setShowTable] = useState(false);

  return (
    <View style={[styles.card, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text> : null}
        </View>
        {table && (
          <TouchableOpacity
            onPress={() => setShowTable((v) => !v)}
            style={[styles.toggle, { borderColor: theme.border }]}
            accessibilityRole="button"
            accessibilityLabel={showTable ? `Show ${title} as chart` : `Show ${title} as table`}
            hitSlop={8}
          >
            <Ionicons name={showTable ? 'stats-chart-outline' : 'list-outline'} size={15} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {legend && legend.length > 1 && !showTable && (
        <View style={styles.legend}>
          {legend.map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View
                style={[
                  l.kind === 'line' ? styles.keyLine : styles.keyRect,
                  { backgroundColor: l.color },
                ]}
              />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>{l.label}</Text>
            </View>
          ))}
        </View>
      )}

      {showTable && table ? <DataTable table={table} /> : children}
    </View>
  );
}

function DataTable({ table }: { table: TableData }) {
  const theme = useTheme();
  return (
    <View accessibilityRole="summary">
      <View style={[styles.tr, { borderBottomColor: theme.border }]}>
        {table.columns.map((c, i) => (
          <Text key={c} style={[styles.th, i > 0 && styles.num, { color: theme.muted }]}>{c}</Text>
        ))}
      </View>
      {table.rows.map((row, r) => (
        <View key={r} style={[styles.tr, { borderBottomColor: theme.border }]}>
          {row.map((cell, i) => (
            <Text key={i} style={[styles.td, i > 0 && styles.num, { color: i === 0 ? theme.textSecondary : theme.text }]}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  titleWrap: { flex: 1, paddingRight: 8 },
  title: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2 },
  toggle: { width: 30, height: 30, borderRadius: 9, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  keyRect: { width: 10, height: 10, borderRadius: 3 },
  keyLine: { width: 14, height: 2, borderRadius: 1 },
  legendText: { fontSize: 12 },
  tr: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth },
  th: { flex: 1, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { flex: 1, fontSize: 13 },
  num: { textAlign: 'right', fontVariant: ['tabular-nums'] },
});
