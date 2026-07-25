import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../hooks/useThemeColor';
import {Transaction, useTransactions} from '../../hooks/useTransactions';
import {formatCurrency} from '../../constants/format';

type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

// Matches YYYY-MM-DD; empty is allowed (means "unbounded").
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const isValidDate = (s: string) => s === '' || DATE_RE.test(s);

export default function AllTransactionsScreen() {
  const theme = useTheme();
  const { transactions, loading, error, fetchTransactions } = useTransactions();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const load = useCallback(() => {
    // Date range is applied server-side (from/to); category + sort are client-side.
    const validFrom = isValidDate(from) ? from : '';
    const validTo = isValidDate(to) ? to : '';
    fetchTransactions({ from: validFrom || undefined, to: validTo || undefined });
  }, [from, to]);

  // Load on first focus. Explicit date changes are applied via the Apply button.
  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const items: Transaction[] = transactions ?? [];

  // Distinct categories present in the current result set, for the filter chips.
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((t) => set.add(t.category || 'other'));
    return Array.from(set).sort();
  }, [items]);

  const visible = useMemo(() => {
    const filtered = category
      ? items.filter((t) => (t.category || 'other') === category)
      : items;
    const sorted = [...filtered].sort((a, b) => {
      let cmp: number;
      if (sortKey === 'amount') {
        cmp = a.amount - b.amount;
      } else {
        cmp = a.date.localeCompare(b.date);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [items, category, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const dateError = !isValidDate(from) || !isValidDate(to);

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={[styles.rowIcon, { backgroundColor: (item.amount < 0 ? theme.danger : theme.success) + '18' }]}>
        <Ionicons
          name={item.amount < 0 ? 'arrow-up' : 'arrow-down'}
          size={16}
          color={item.amount < 0 ? theme.danger : theme.success}
        />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.desc, { color: theme.text }]}>{item.description}</Text>
        <Text style={[styles.rowMeta, { color: theme.muted }]}>
          {new Date(item.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}
          {'  ·  '}
          {item.category || 'other'}
        </Text>
      </View>
      <Text style={[styles.amt, { color: item.amount < 0 ? theme.danger : theme.success }]}>
        {formatCurrency(item.amount)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.filterCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Date range */}
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={[styles.label, { color: theme.muted }]}>From</Text>
            <TextInput
              style={[styles.dateInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.muted}
              value={from}
              onChangeText={setFrom}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.label, { color: theme.muted }]}>To</Text>
            <TextInput
              style={[styles.dateInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.muted}
              value={to}
              onChangeText={setTo}
              autoCapitalize="none"
            />
          </View>
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: dateError ? theme.border : theme.accent }]}
            onPress={load}
            disabled={dateError}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={18} color={dateError ? theme.muted : '#fff'} />
          </TouchableOpacity>
        </View>
        {dateError && (
          <Text style={[styles.errText, { color: theme.danger }]}>Use dates like 2026-07-19.</Text>
        )}

        {/* Category chips */}
        {categories.length > 0 && (
          <FlatList
            horizontal
            data={['All', ...categories]}
            keyExtractor={(c) => c}
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            renderItem={({ item: c }) => {
              const active = c === 'All' ? category === null : category === c;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    { borderColor: theme.border },
                    active && { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}
                  onPress={() => setCategory(c === 'All' ? null : c)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, { color: active ? '#fff' : theme.textSecondary }]}>{c}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Sort controls */}
        <View style={styles.sortRow}>
          <Text style={[styles.label, { color: theme.muted }]}>Sort</Text>
          {(['date', 'amount'] as SortKey[]).map((key) => {
            const active = sortKey === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.sortBtn, { borderColor: theme.border }, active && { borderColor: theme.accent }]}
                onPress={() => toggleSort(key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.sortText, { color: active ? theme.accent : theme.textSecondary }]}>
                  {key === 'date' ? 'Date' : 'Amount'}
                </Text>
                {active && (
                  <Ionicons
                    name={sortDir === 'asc' ? 'arrow-up' : 'arrow-down'}
                    size={13}
                    color={theme.accent}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accent} />
      ) : error ? (
        <View style={styles.empty}>
          <Ionicons name="cloud-offline-outline" size={40} color={theme.muted} />
          <Text style={[styles.emptyText, { color: theme.muted }]}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={40} color={theme.muted} />
              <Text style={[styles.emptyText, { color: theme.muted }]}>No transactions match.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filterCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  dateField: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  dateInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14 },
  applyBtn: { width: 40, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  errText: { fontSize: 12, marginTop: 8 },
  chipRow: { marginTop: 14, flexGrow: 0 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '500' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  sortText: { fontSize: 13, fontWeight: '500' },
  list: { paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, marginLeft: 12 },
  desc: { fontSize: 15, fontWeight: '500' },
  rowMeta: { fontSize: 12, marginTop: 2 },
  amt: { fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14, textAlign: 'center' },
});
