import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';

interface TransactionCardProps {
  description: string;
  amount: number;
  category?: string;
  date: string;
}

export function TransactionCard({ description, amount, category, date }: TransactionCardProps) {
  const theme = useTheme();
  const isExpense = amount < 0;
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.header}>
        <Ionicons name="checkmark-circle" size={16} color={theme.success} />
        <Text style={[styles.label, { color: theme.textSecondary }]}>Transaction logged</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.description, { color: theme.text }]}>{description}</Text>
        <Text style={[styles.amount, { color: isExpense ? theme.danger : theme.success }]}>
          {isExpense ? '-' : '+'}${Math.abs(amount).toFixed(2)}
        </Text>
      </View>
      <View style={styles.footer}>
        {category && (
          <View style={[styles.tag, { backgroundColor: theme.accent + '20' }]}>
            <Text style={[styles.tagText, { color: theme.accent }]}>{category}</Text>
          </View>
        )}
        <Text style={[styles.date, { color: theme.muted }]}>{formattedDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 4, maxWidth: 280 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  label: { fontSize: 12, fontWeight: '500' },
  body: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  description: { fontSize: 15, fontWeight: '600', flex: 1 },
  amount: { fontSize: 18, fontWeight: '700', marginLeft: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: '600' },
  date: { fontSize: 11 },
});
