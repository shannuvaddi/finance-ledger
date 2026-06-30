import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {ActionCard} from '../../components/ui/ActionCard';
import {useTheme} from '../../hooks/useThemeColor';
import {useAuth} from '../../context/AuthContext';

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { logout, user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hi, {user?.name?.split(' ')[0] ?? 'there'}</Text>
          <Text style={[styles.title, { color: theme.text }]}>Chanakya</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => { logout(); }}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.muted} />
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceCard, { backgroundColor: theme.accent }]}>
        <Text style={styles.balanceLabel}>Your Advisor</Text>
        <Text style={styles.balanceTagline}>Track, record, and ask — all in one place.</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Quick Actions</Text>

      <ActionCard
        title="Log Transaction"
        subtitle="Add an expense or income"
        icon="create-outline"
        onPress={() => router.push('/(tabs)/transactions')}
      />
      <ActionCard
        title="Voice Record"
        subtitle="Speak to log a transaction"
        icon="mic-outline"
        onPress={() => router.push('/(tabs)/voice')}
      />
      <ActionCard
        title="Ask Chanakya"
        subtitle="Chat with your finance assistant"
        icon="chatbubble-ellipses-outline"
        onPress={() => router.push('/(tabs)/assistant')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  greeting: { fontSize: 14, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  balanceCard: { borderRadius: 18, padding: 22, marginBottom: 28 },
  balanceLabel: { color: '#fff', fontSize: 13, fontWeight: '500', opacity: 0.85, marginBottom: 6 },
  balanceTagline: { color: '#fff', fontSize: 17, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
});
