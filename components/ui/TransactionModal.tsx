import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { useApi } from '../../hooks/useApi';
import { Transaction } from '../../hooks/useTransactions';
import { categoryLabel, categoryMeta, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories';

type Kind = 'expense' | 'income' | 'savings';

const KINDS: { kind: Kind; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { kind: 'expense', label: 'Expense', icon: 'arrow-up-circle-outline' },
  { kind: 'income', label: 'Income', icon: 'arrow-down-circle-outline' },
  { kind: 'savings', label: 'Savings', icon: 'shield-checkmark-outline' },
];

/** Today as YYYY-MM-DD in local time (toISOString would give the UTC date). */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface Props {
  visible: boolean;
  /** When set, the form edits this transaction (and offers delete) instead of adding one. */
  transaction?: Transaction | null;
  onClose: () => void;
  /** Called after a successful save or delete. */
  onChanged?: () => void;
}

/** Which form tab an existing transaction belongs to. */
function kindOf(tx: Transaction): Kind {
  if ((tx.category || '').toLowerCase() === 'savings') return 'savings';
  return tx.amount > 0 ? 'income' : 'expense';
}

/**
 * Add or edit an expense, income, or a savings transfer. Amounts are typed as positive
 * numbers; the sign and type are derived from the kind (expenses and savings are money out).
 */
export function TransactionModal({ visible, transaction, onClose, onChanged }: Props) {
  const theme = useTheme();
  // Own request state, so saving never clobbers a screen's transaction list.
  const { loading, error, request } = useApi<Transaction>();

  const [kind, setKind] = useState<Kind>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('groceries');
  const [date, setDate] = useState(today());
  const [formError, setFormError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const editing = transaction != null;

  useEffect(() => {
    if (!visible) return;
    setFormError('');
    setConfirmDelete(false);
    if (transaction) {
      setKind(kindOf(transaction));
      setAmount(String(Math.abs(transaction.amount)).replace('.', ','));
      setDescription(transaction.description);
      setCategory((transaction.category || 'other').toLowerCase());
      setDate(transaction.date.slice(0, 10));
    } else {
      setKind('expense');
      setAmount('');
      setDescription('');
      setCategory('groceries');
      setDate(today());
    }
  }, [visible, transaction]);

  const pickKind = (k: Kind) => {
    setKind(k);
    setCategory(k === 'expense' ? 'groceries' : k === 'income' ? 'salary' : 'savings');
  };

  const save = async () => {
    const value = parseFloat(amount.replace(/\s/g, '').replace(',', '.'));
    if (!isFinite(value) || value <= 0) return setFormError('Enter an amount greater than 0');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date).getTime())) return setFormError('Date must be YYYY-MM-DD');
    setFormError('');

    const out = kind !== 'income';
    const body = {
      description: description.trim() || categoryLabel(category),
      amount: out ? -value : value,
      category,
      date,
      type: out ? 'debit' : 'credit',
    };
    const tx = editing
      ? await request(`/transactions/${transaction!.id}`, 'PUT', body)
      : await request('/transactions', 'POST', body);
    if (tx) {
      onChanged?.();
      onClose();
    }
  };

  // Two-step delete: the first tap arms it (native Alert confirms don't work on web).
  const remove = () => {
    if (!confirmDelete) return setConfirmDelete(true);
    setDeleting(true);
    request(`/transactions/${transaction!.id}`, 'DELETE');
  };

  // A successful DELETE (204) and a failure both resolve to null, so wait for the request
  // state to settle and only close when there's no error.
  useEffect(() => {
    if (!deleting || loading) return;
    setDeleting(false);
    if (!error) {
      onChanged?.();
      onClose();
    }
  }, [deleting, loading, error]);

  const base = kind === 'expense' ? EXPENSE_CATEGORIES : kind === 'income' ? INCOME_CATEGORIES : [];
  // Keep an existing entry's category selectable even if it isn't in the default list (e.g. a refund).
  const categories = kind !== 'savings' && category !== 'savings' && !base.includes(category) ? [category, ...base] : base;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{editing ? 'Edit transaction' : 'Add transaction'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={theme.muted} />
            </TouchableOpacity>
          </View>

          <View style={[styles.segment, { backgroundColor: theme.background, borderColor: theme.border }]}>
            {KINDS.map((k) => {
              const active = k.kind === kind;
              return (
                <TouchableOpacity
                  key={k.kind}
                  style={[styles.segmentBtn, active && { backgroundColor: theme.accent }]}
                  onPress={() => pickKind(k.kind)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Ionicons name={k.icon} size={15} color={active ? '#fff' : theme.textSecondary} />
                  <Text style={[styles.segmentText, { color: active ? '#fff' : theme.textSecondary }]}>{k.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {kind === 'savings' && (
            <Text style={[styles.note, { color: theme.textSecondary }]}>
              Money moved to savings or investments. It's shown as saved, not spent.
            </Text>
          )}

          <Text style={[styles.label, { color: theme.muted }]}>Amount (kr)</Text>
          <TextInput
            style={[styles.input, styles.amount, { color: theme.text, borderColor: theme.border }]}
            placeholder="0"
            placeholderTextColor={theme.muted}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />

          <Text style={[styles.label, { color: theme.muted }]}>Description</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder={kind === 'income' ? 'e.g. Salary' : kind === 'savings' ? 'e.g. Monthly transfer to ISK' : 'e.g. Home loan EMI'}
            placeholderTextColor={theme.muted}
            value={description}
            onChangeText={setDescription}
          />

          {categories.length > 0 && (
            <>
              <Text style={[styles.label, { color: theme.muted }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                {categories.map((c) => {
                  const meta = categoryMeta(c);
                  const active = c === category;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.chip, { borderColor: active ? meta.color : theme.border }, active && { backgroundColor: meta.color + '1F' }]}
                      onPress={() => setCategory(c)}
                    >
                      <Ionicons name={meta.icon} size={14} color={meta.color} />
                      <Text style={[styles.chipText, { color: theme.text }]}>{categoryLabel(c)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Text style={[styles.label, { color: theme.muted }]}>Date</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.muted}
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
          />

          {formError || error ? (
            <Text style={[styles.error, { color: theme.danger }]}>{formError || error}</Text>
          ) : null}

          <View style={styles.actions}>
            {editing && (
              <TouchableOpacity
                onPress={remove}
                disabled={loading}
                style={[styles.btn, styles.deleteBtn, confirmDelete && { backgroundColor: theme.danger }]}
                accessibilityLabel={confirmDelete ? 'Confirm delete' : 'Delete transaction'}
              >
                <Ionicons name="trash-outline" size={15} color={confirmDelete ? '#fff' : theme.danger} />
                <Text style={[styles.btnText, { color: confirmDelete ? '#fff' : theme.danger }]}>
                  {confirmDelete ? 'Tap to confirm' : 'Delete'}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.btn}>
              <Text style={[styles.btnText, { color: theme.muted }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={save} disabled={loading} style={[styles.btn, { backgroundColor: theme.accent }]}>
              <Text style={[styles.btnText, { color: '#fff' }]}>{loading ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', padding: 24 },
  card: { borderRadius: 20, padding: 20, width: '100%', maxWidth: 460, alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  segment: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, padding: 3 },
  segmentBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 9 },
  segmentText: { fontSize: 13, fontWeight: '600' },
  note: { fontSize: 12, marginTop: 8 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  amount: { fontSize: 22, fontWeight: '700' },
  chips: { gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  chipText: { fontSize: 13, fontWeight: '500' },
  error: { fontSize: 13, marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  btn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 'auto', paddingHorizontal: 12 },
  btnText: { fontSize: 14, fontWeight: '600' },
});
