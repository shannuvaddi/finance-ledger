import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../hooks/useThemeColor';
import {Transaction, useTransactions} from '../../hooks/useTransactions';
import {formatCurrency} from '../../constants/format';
import {PeriodHeader} from '../../components/ui/PeriodHeader';
import {usePeriod} from '../../context/PeriodContext';
import {categoryLabel, categoryMeta} from '../../constants/categories';
import {cardShadow} from '../../constants/gradients';
import {illustrations} from '../../constants/illustrations';
import {TransactionModal} from '../../components/ui/TransactionModal';

type SortKey = 'date' | 'amount';
type SortDir = 'asc' | 'desc';

export default function AllTransactionsScreen() {
  const theme = useTheme();
  const { transactions, loading, error, fetchTransactions } = useTransactions();
  const { periodParam } = usePeriod();

  const [category, setCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const load = useCallback(() => {
    // Scoped to the globally-selected period; category + sort are client-side.
    fetchTransactions({ period: periodParam });
  }, [periodParam]);

  // Reload whenever the screen refocuses or the selected period changes.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
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

  const renderItem = ({ item }: { item: Transaction }) => {
    const meta = categoryMeta(item.category);
    return (
      <TouchableOpacity
        style={[styles.row, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => setEditing(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${item.description}`}
      >
        <View style={[styles.rowIcon, { backgroundColor: meta.color + '1F' }]}>
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View style={styles.rowText}>
          <Text style={[styles.desc, { color: theme.text }]}>{item.description}</Text>
          <Text style={[styles.rowMeta, { color: theme.muted }]}>
            {new Date(item.date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}
            {'  ·  '}
            {categoryLabel(item.category)}
          </Text>
        </View>
        <Text style={[styles.amt, { color: item.category === 'savings' ? theme.text : item.amount < 0 ? theme.danger : theme.success }]}>
          {formatCurrency(item.amount)}
        </Text>
        <Ionicons name="create-outline" size={16} color={theme.muted} style={styles.editIcon} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PeriodHeader />
      <View style={styles.content}>
      <View style={[styles.filterCard, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }]}>
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
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.accent }]}
            onPress={() => setAdding(true)}
            activeOpacity={0.8}
            accessibilityLabel="Add transaction"
          >
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
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
              <Image
                source={illustrations.empty.source}
                style={styles.emptyArt}
                resizeMode="contain"
              />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Nothing here yet</Text>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                No transactions match. Try another period or log one with Voice or Chanakya.
              </Text>
            </View>
          }
        />
      )}
      </View>
      <TransactionModal
        visible={adding || editing != null}
        transaction={editing}
        onClose={() => { setAdding(false); setEditing(null); }}
        onChanged={load}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  filterCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  chipRow: { flexGrow: 0 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '500' },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  sortText: { fontSize: 13, fontWeight: '500' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  list: { paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 8, borderWidth: 1, borderRadius: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, marginLeft: 12 },
  desc: { fontSize: 15, fontWeight: '500' },
  rowMeta: { fontSize: 12, marginTop: 2 },
  amt: { fontSize: 15, fontWeight: '700' },
  editIcon: { marginLeft: 10 },
  empty: { alignItems: 'center', marginTop: 40, gap: 8, paddingHorizontal: 24 },
  emptyArt: { width: 200, height: 200 / illustrations.empty.aspectRatio, marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '700' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
