import React, {useEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../hooks/useThemeColor';
import {useTransactions} from '../../hooks/useTransactions';

export default function TransactionsScreen() {
  const theme = useTheme();
  const { transactions, loading, createTransaction, fetchTransactions } = useTransactions();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleSubmit = async () => {
    if (!description.trim() || !amount.trim()) return;
    setDescription('');
    setAmount('');
    await createTransaction(description.trim(), parseFloat(amount) || 0);
    fetchTransactions();
  };

  const allItems = transactions ?? [];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="What did you spend on?"
          placeholderTextColor={theme.muted}
          value={description}
          onChangeText={setDescription}
        />
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.amountInput, { color: theme.text, borderColor: theme.border }]}
            placeholder="$0.00"
            placeholderTextColor={theme.muted}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.accent }]}
            onPress={handleSubmit}
            disabled={loading || !description.trim() || !amount.trim()}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={allItems}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
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
              <Text style={[styles.rowDate, { color: theme.muted }]}>
                {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
            <Text style={[styles.amt, { color: item.amount < 0 ? theme.danger : theme.success }]}>
              {item.amount < 0 ? '-' : '+'}${Math.abs(item.amount).toFixed(2)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={40} color={theme.muted} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>No transactions yet</Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 12 },
  inputCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  input: { fontSize: 15, paddingVertical: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  amountInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 8 },
  sendBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1, marginLeft: 12 },
  desc: { fontSize: 15, fontWeight: '500' },
  rowDate: { fontSize: 12, marginTop: 2 },
  amt: { fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyText: { fontSize: 14 },
});
