import React, {useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {ActionCard} from '../../components/ui/ActionCard';
import {PeriodHeader} from '../../components/ui/PeriodHeader';
import {useTheme} from '../../hooks/useThemeColor';
import {useAuth} from '../../context/AuthContext';
import {useWideLayout} from '../../hooks/useWideLayout';
import {brand} from '../../constants/Colors';
import {cardShadow, linearGradient} from '../../constants/gradients';
import {illustrations, logo} from '../../constants/illustrations';
import {TransactionModal} from '../../components/ui/TransactionModal';

export default function DashboardScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { logout, user } = useAuth();
  const wide = useWideLayout();
  const [adding, setAdding] = useState(false);

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.container, wide && styles.containerWide]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Image source={logo} style={styles.logo} />
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hi, {user?.name?.split(' ')[0] ?? 'there'} 👋</Text>
            <Text style={[styles.title, { color: theme.text }]}>Chanakya</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => { logout(); }}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.muted} />
        </TouchableOpacity>
      </View>

      <View style={[styles.periodWrap, cardShadow, { borderColor: theme.border }]}>
        <PeriodHeader />
      </View>

      <View style={[styles.heroCard, linearGradient(brand.orange, brand.orangeLight), { backgroundColor: theme.accent }]}>
        <View style={styles.heroText}>
          <Text style={styles.heroLabel}>Your Advisor</Text>
          <Text style={styles.heroTagline}>Track, record, and ask — all in one place.</Text>
          <TouchableOpacity style={styles.heroCta} onPress={() => router.push('/(tabs)/assistant')} activeOpacity={0.8}>
            <Text style={[styles.heroCtaText, { color: brand.orange }]}>Ask Chanakya</Text>
            <Ionicons name="arrow-forward" size={14} color={brand.orange} />
          </TouchableOpacity>
        </View>
        <Image
          source={illustrations.banner.source}
          style={styles.heroArt}
          resizeMode="contain"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Quick Actions</Text>

      <View style={wide && styles.actionGrid}>
        {[
          { title: 'Add transaction', subtitle: 'Log an expense, income, or savings', icon: 'add-circle-outline', color: '#E65100', href: null },
          { title: 'Dashboard', subtitle: 'Trends, pace, and where your money goes', icon: 'analytics-outline', color: '#00897B', href: '/(tabs)/dashboard' },
          { title: 'Voice Record', subtitle: 'Speak to log a transaction', icon: 'mic-outline', color: '#D81B60', href: '/(tabs)/voice' },
          { title: 'Ask Chanakya', subtitle: 'Chat with your finance assistant', icon: 'chatbubble-ellipses-outline', color: '#8E24AA', href: '/(tabs)/assistant' },
          { title: 'Budgets', subtitle: 'See how each category is tracking', icon: 'pie-chart-outline', color: '#2E7D32', href: '/(tabs)/budget' },
          { title: 'History', subtitle: 'Browse, filter, and sort transactions', icon: 'receipt-outline', color: '#1E88E5', href: '/(tabs)/all' },
        ].map((a) => (
          <View key={a.title} style={wide && styles.actionCell}>
            <ActionCard
              title={a.title}
              subtitle={a.subtitle}
              icon={a.icon as React.ComponentProps<typeof Ionicons>['name']}
              color={a.color}
              onPress={() => (a.href ? router.push(a.href as any) : setAdding(true))}
            />
          </View>
        ))}
      </View>
      <TransactionModal visible={adding} onClose={() => setAdding(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 64, paddingBottom: 32 },
  containerWide: { paddingTop: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 48, height: 48, borderRadius: 14 },
  greeting: { fontSize: 14, marginBottom: 2 },
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  logoutBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  periodWrap: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  heroCard: {
    borderRadius: 22,
    padding: 22,
    marginBottom: 28,
    minHeight: 160,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    boxShadow: '0px 10px 24px rgba(230, 81, 0, 0.28)',
  },
  heroText: { flex: 1, zIndex: 1, paddingRight: 8 },
  heroLabel: { color: '#fff', fontSize: 13, fontWeight: '600', opacity: 0.85, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 },
  heroTagline: { color: '#fff', fontSize: 19, fontWeight: '700', lineHeight: 25, marginBottom: 16 },
  heroCta: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  heroCtaText: { fontSize: 13, fontWeight: '700' },
  heroArt: { width: 150, height: 150 / illustrations.banner.aspectRatio, marginRight: -12, marginBottom: -22, alignSelf: 'flex-end' },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  actionCell: { width: '50%', paddingHorizontal: 6 },
});
