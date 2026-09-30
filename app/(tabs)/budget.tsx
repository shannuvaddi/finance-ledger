import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { PeriodHeader } from '../../components/ui/PeriodHeader';
import { usePeriod } from '../../context/PeriodContext';
import { useBudgets, CategorySpend } from '../../hooks/useBudgets';
import { formatCurrency } from '../../constants/format';
import { brand } from '../../constants/Colors';
import { categoryLabel, categoryMeta } from '../../constants/categories';
import { cardShadow, linearGradient } from '../../constants/gradients';
import { illustrations } from '../../constants/illustrations';

const kr = (n: number) => formatCurrency(n).replace('+', '');

export default function BudgetScreen() {
  const theme = useTheme();
  const { periodParam } = usePeriod();
  const { overview, loading, error, saving, fetchOverview, setBudget } = useBudgets();

  const [editing, setEditing] = useState<CategorySpend | null>(null);
  const [amountText, setAmountText] = useState('');

  const load = useCallback(() => {
    fetchOverview(periodParam);
  }, [periodParam]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openEditor = (row: CategorySpend) => {
    setEditing(row);
    setAmountText(row.budget != null ? String(row.budget) : '');
  };

  const closeEditor = () => {
    setEditing(null);
    setAmountText('');
  };

  const save = async () => {
    if (!editing) return;
    const amount = parseFloat(amountText.replace(',', '.'));
    if (!isFinite(amount) || amount <= 0) return;
    await setBudget(editing.category, amount);
    closeEditor();
    load();
  };

  const rows = overview?.categories ?? [];
  const totalSpent = rows.reduce((sum, r) => sum + r.spent, 0);
  const totalBudget = rows.reduce((sum, r) => sum + (r.budget ?? 0), 0);
  const totalPct = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;

  const summary = (
    <View style={[styles.summary, linearGradient(brand.orange, brand.orangeLight), { backgroundColor: theme.accent }]}>
      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>Spent this period</Text>
        <Text style={styles.summaryAmount}>{kr(totalSpent)}</Text>
        <Text style={styles.summarySub}>
          {totalBudget > 0 ? `of ${kr(totalBudget)} budgeted` : 'No budgets set yet'}
        </Text>
        {totalBudget > 0 && (
          <View style={styles.summaryTrack}>
            <View style={[styles.summaryFill, { width: `${totalPct * 100}%` }]} />
          </View>
        )}
      </View>
      <Image
        source={illustrations.piggy.source}
        style={styles.summaryArt}
        resizeMode="contain"
      />
    </View>
  );

  const renderRow = ({ item }: { item: CategorySpend }) => {
    const hasBudget = item.budget != null;
    const pct = hasBudget && item.budget! > 0 ? Math.min(item.spent / item.budget!, 1) : 0;
    const over = hasBudget && item.spent > item.budget!;
    const meta = categoryMeta(item.category);
    const barColor = over ? theme.danger : meta.color;

    return (
      <TouchableOpacity
        style={[styles.row, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => openEditor(item)}
        activeOpacity={0.7}
      >
        <View style={styles.rowHeader}>
          <View style={styles.categoryWrap}>
            <View style={[styles.categoryIcon, { backgroundColor: meta.color + '1F' }]}>
              <Ionicons name={meta.icon} size={16} color={meta.color} />
            </View>
            <Text style={[styles.category, { color: theme.text }]}>{categoryLabel(item.category)}</Text>
          </View>
          <Text style={[styles.amounts, { color: theme.textSecondary }]}>
            {kr(item.spent)}
            {hasBudget ? ` / ${kr(item.budget!)}` : ''}
          </Text>
        </View>

        {hasBudget ? (
          <>
            <View style={[styles.track, { backgroundColor: theme.border }]}>
              <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
            </View>
            <Text style={[styles.remaining, { color: over ? theme.danger : theme.muted }]}>
              {over
                ? `Over by ${kr(item.spent - item.budget!)}`
                : `${kr(item.remaining ?? 0)} left`}
            </Text>
          </>
        ) : (
          <Text style={[styles.noBudget, { color: theme.muted }]}>Tap to set a budget</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PeriodHeader />

      {loading && !overview ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accent} />
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={40} color={theme.muted} />
          <Text style={[styles.emptyText, { color: theme.muted }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.category}
          renderItem={renderRow}
          ListHeaderComponent={summary}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={!!editing} transparent animationType="fade" onRequestClose={closeEditor}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Budget for {categoryLabel(editing?.category)}
            </Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="Amount (kr)"
              placeholderTextColor={theme.muted}
              keyboardType="decimal-pad"
              value={amountText}
              onChangeText={setAmountText}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={closeEditor} style={styles.modalBtn}>
                <Text style={[styles.modalBtnText, { color: theme.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={save}
                style={[styles.modalBtn, styles.saveBtn, { backgroundColor: theme.accent }]}
                disabled={saving}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{saving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 10 },
  row: { borderWidth: 1, borderRadius: 14, padding: 14 },
  summary: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 10px 24px rgba(230, 81, 0, 0.25)',
  },
  summaryText: { flex: 1, zIndex: 1 },
  summaryLabel: { color: '#fff', fontSize: 12, fontWeight: '600', opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryAmount: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  summarySub: { color: '#fff', fontSize: 13, opacity: 0.9, marginTop: 2 },
  summaryTrack: { height: 6, borderRadius: 3, backgroundColor: '#FFFFFF40', overflow: 'hidden', marginTop: 12, maxWidth: 220 },
  summaryFill: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
  summaryArt: { width: 110, height: 110 / illustrations.piggy.aspectRatio, marginRight: -8, marginVertical: -8 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  categoryIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  category: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
  amounts: { fontSize: 13, fontWeight: '500' },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  remaining: { fontSize: 12, marginTop: 6 },
  noBudget: { fontSize: 12, fontStyle: 'italic' },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  modalBackdrop: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 32 },
  modalCard: { borderRadius: 20, padding: 20, width: '100%', maxWidth: 420, alignSelf: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14, textTransform: 'capitalize' },
  modalInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
  modalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  saveBtn: {},
  modalBtnText: { fontSize: 14, fontWeight: '600' },
});
