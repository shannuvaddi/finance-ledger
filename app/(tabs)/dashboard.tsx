import React, { useCallback } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, useWindowDimensions, View, ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { SIDEBAR_WIDTH, useWideLayout } from '../../hooks/useWideLayout';
import { Insights, useInsights } from '../../hooks/useInsights';
import { usePeriod } from '../../context/PeriodContext';
import { PeriodHeader } from '../../components/ui/PeriodHeader';
import { ChartCard } from '../../components/charts/ChartCard';
import { Delta, StatTile } from '../../components/charts/StatTile';
import { LineChart } from '../../components/charts/LineChart';
import { ColumnChart } from '../../components/charts/ColumnChart';
import { BarList } from '../../components/charts/BarList';
import { StackedBar } from '../../components/charts/StackedBar';
import { Meter } from '../../components/charts/Meter';
import { ChartColors, useChartColors } from '../../constants/chartColors';
import { brand } from '../../constants/Colors';
import { categoryLabel, categoryMeta } from '../../constants/categories';
import { formatCompact, formatKr } from '../../constants/format';
import { cardShadow, linearGradient } from '../../constants/gradients';
import { illustrations } from '../../constants/illustrations';
import { parsePeriodParam, shiftPeriod } from '../../constants/period';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS: Record<string, string> = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };
const WEEKDAY_PLURAL: Record<string, string> = {
  MON: 'Mondays', TUE: 'Tuesdays', WED: 'Wednesdays', THU: 'Thursdays', FRI: 'Fridays', SAT: 'Saturdays', SUN: 'Sundays',
};

const monthShort = (period: string) => MONTHS[parsePeriodParam(period).month - 1];
const monthLong = (period: string) => `${monthShort(period)} ${parsePeriodParam(period).year}`;
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });

// Content-width breakpoints (desktop web, next to the sidebar).
const MD_MIN = 800;   // two columns
const XL_MIN = 1150;  // three columns
const MAX_WIDTH = 1680;

type Mode = 'stack' | 'md' | 'xl';

function useDashboardMode(): Mode {
  const wide = useWideLayout();
  const { width } = useWindowDimensions();
  if (!wide) return 'stack';
  const content = width - SIDEBAR_WIDTH;
  return content >= XL_MIN ? 'xl' : content >= MD_MIN ? 'md' : 'stack';
}

export default function DashboardScreen() {
  const theme = useTheme();
  const colors = useChartColors();
  const wide = useWideLayout();
  const mode = useDashboardMode();
  const { periodParam } = usePeriod();
  const { insights, loading, error, fetchInsights } = useInsights();

  useFocusEffect(useCallback(() => { fetchInsights(periodParam); }, [periodParam]));

  // A stale period's data is held (dimmed) while the selected period loads.
  const data = insights;
  const stale = loading || (data != null && data.period !== periodParam);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PeriodHeader />
      {!data ? (
        loading || !error ? (
          <ActivityIndicator style={{ marginTop: 48 }} color={theme.accent} />
        ) : (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={40} color={theme.muted} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>{error}</Text>
          </View>
        )
      ) : (
        <ScrollView contentContainerStyle={[styles.content, wide && styles.contentWide]} showsVerticalScrollIndicator={false}>
          <View style={[styles.stack, { opacity: stale ? 0.5 : 1 }]}>
            <DashboardBody data={data} colors={colors} mode={mode} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/** Arranges the sections for the current width: a single stack on phones, 2 or 3 columns on desktop. */
function DashboardBody({ data, colors, mode }: { data: Insights; colors: ChartColors; mode: Mode }) {
  const highlights = buildHighlights(data);
  const empty = data.summary.transactionCount === 0;
  const fill = styles.fill;

  if (mode === 'stack') {
    return (
      <>
        <Hero data={data} />
        <KpiGrid data={data} columns={2} />
        {highlights.length > 0 && <Highlights items={highlights} />}
        {empty ? (
          <>
            <EmptyCard />
            <TrendCard data={data} colors={colors} />
          </>
        ) : (
          <>
            <PaceCard data={data} colors={colors} />
            <TrendCard data={data} colors={colors} />
            <CategoryCard data={data} />
            <WeekdayCard data={data} colors={colors} />
            {data.budget && <BudgetCard data={data} colors={colors} />}
            <SourcesCard data={data} colors={colors} />
            <TopExpensesCard data={data} />
          </>
        )}
      </>
    );
  }

  const xl = mode === 'xl';
  const top = xl ? (
    <Row>
      <Cell><Hero data={data} style={fill} /></Cell>
      <Cell><KpiGrid data={data} columns={2} style={fill} /></Cell>
      {highlights.length > 0 && <Cell><Highlights items={highlights} style={fill} /></Cell>}
    </Row>
  ) : (
    <>
      <Row>
        <Cell><Hero data={data} style={fill} /></Cell>
        {highlights.length > 0 && <Cell><Highlights items={highlights} style={fill} /></Cell>}
      </Row>
      <KpiGrid data={data} columns={4} />
    </>
  );

  if (empty) {
    return (
      <>
        {top}
        <Row>
          <Cell><EmptyCard style={fill} /></Cell>
          <Cell flex={xl ? 2 : 1}><TrendCard data={data} colors={colors} style={fill} chartHeight={200} /></Cell>
        </Row>
      </>
    );
  }

  const budgetAndSources = (
    <View style={[styles.stack, fill]}>
      {data.budget && <BudgetCard data={data} colors={colors} />}
      <SourcesCard data={data} colors={colors} style={fill} />
    </View>
  );

  if (xl) {
    return (
      <>
        {top}
        <Row>
          <Cell flex={2}><PaceCard data={data} colors={colors} style={fill} chartHeight={260} /></Cell>
          <Cell><CategoryCard data={data} style={fill} /></Cell>
        </Row>
        <Row>
          <Cell><TrendCard data={data} colors={colors} style={fill} chartHeight={190} /></Cell>
          <Cell><WeekdayCard data={data} colors={colors} style={fill} chartHeight={190} /></Cell>
          <Cell>{budgetAndSources}</Cell>
        </Row>
        <TopExpensesCard data={data} wide />
      </>
    );
  }

  return (
    <>
      {top}
      <Row>
        <Cell><PaceCard data={data} colors={colors} style={fill} chartHeight={220} /></Cell>
        <Cell><CategoryCard data={data} style={fill} /></Cell>
      </Row>
      <Row>
        <Cell><TrendCard data={data} colors={colors} style={fill} chartHeight={170} /></Cell>
        <Cell><WeekdayCard data={data} colors={colors} style={fill} chartHeight={170} /></Cell>
      </Row>
      <Row>
        <Cell>{budgetAndSources}</Cell>
        <Cell><TopExpensesCard data={data} style={fill} /></Cell>
      </Row>
    </>
  );
}

// --- sections -------------------------------------------------------------------------------

function Hero({ data, style }: { data: Insights; style?: ViewStyle }) {
  const { summary, daysElapsed, daysInPeriod, to } = data;
  const inProgress = daysElapsed > 0 && daysElapsed < daysInPeriod;
  return (
    <View style={[styles.hero, linearGradient(brand.orange, brand.orangeLight), { backgroundColor: brand.orange }, style]}>
      <Text style={styles.heroLabel}>Spent this period</Text>
      <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>{formatKr(summary.expenses)}</Text>
      <Text style={styles.heroSub}>
        {inProgress
          ? `On pace for ${formatKr(summary.projectedExpenses)} by ${shortDate(to)}`
          : `${summary.transactionCount} transactions · ${formatKr(summary.avgDailySpend)} per day`}
      </Text>
      <View style={styles.heroMeterRow}>
        <View style={{ flex: 1 }}>
          <Meter ratio={daysInPeriod ? daysElapsed / daysInPeriod : 0} color="#FFFFFF" track="#FFFFFF40" height={6} />
        </View>
        <Text style={styles.heroDays}>
          {daysElapsed >= daysInPeriod ? 'Period complete' : `Day ${daysElapsed} of ${daysInPeriod}`}
        </Text>
      </View>
    </View>
  );
}

function KpiGrid({ data, columns, style }: { data: Insights; columns: 2 | 4; style?: ViewStyle }) {
  const { summary: s, previous: p } = data;
  const prevLabel = `vs ${monthShort(prevPeriod(data.period))}`;
  const tiles = [
    { label: 'Income', value: formatKr(s.income), icon: 'arrow-down-circle-outline' as const, delta: pctDelta(s.income, p.income, true, prevLabel) },
    { label: 'Saved', value: formatKr(s.saved), icon: 'shield-checkmark-outline' as const, delta: amountDelta(s.saved, p.saved, true, prevLabel) },
    {
      label: 'Savings rate',
      value: s.savingsRate != null ? `${Math.round(s.savingsRate)}%` : '—',
      icon: 'pie-chart-outline' as const,
      delta: s.savingsRate != null && p.savingsRate != null ? pointDelta(s.savingsRate, p.savingsRate, prevLabel) : null,
    },
    { label: 'Left over', value: `${s.net < 0 ? '−' : ''}${formatKr(s.net)}`, icon: 'wallet-outline' as const, delta: amountDelta(s.net, p.net, true, prevLabel) },
  ];
  const rows = columns === 4 ? [tiles] : [tiles.slice(0, 2), tiles.slice(2)];
  return (
    <View style={[styles.kpiGrid, style]}>
      {rows.map((row, i) => (
        <View key={i} style={styles.kpiRow}>
          {row.map((t) => <StatTile key={t.label} {...t} />)}
        </View>
      ))}
    </View>
  );
}

function Highlights({ items, style }: { items: Highlight[]; style?: ViewStyle }) {
  const theme = useTheme();
  const colors = useChartColors();
  return (
    <View style={[styles.highlights, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      <View style={styles.highlightsHeader}>
        <Ionicons name="sparkles-outline" size={15} color={theme.accent} />
        <Text style={[styles.highlightsTitle, { color: theme.text }]}>Chanakya noticed</Text>
      </View>
      {items.map((h, i) => {
        const tint = h.tone === 'good' ? colors.good : h.tone === 'bad' ? colors.critical : theme.accent;
        return (
          <View key={i} style={styles.highlightRow}>
            <View style={[styles.highlightIcon, { backgroundColor: tint + '1F' }]}>
              <Ionicons name={h.icon} size={14} color={tint} />
            </View>
            <Text style={[styles.highlightText, { color: theme.text }]}>{h.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

function PaceCard({ data, colors, style, chartHeight }: CardProps) {
  const prev = monthShort(prevPeriod(data.period));
  const cur = monthShort(data.period);
  const labels = data.pace.map((p) => (p.date ? `Day ${p.day} · ${shortDate(p.date)}` : `Day ${p.day}`));
  const last = [...data.pace].reverse().find((p) => p.current != null);
  const sameDayPrev = last ? data.pace[last.day - 1]?.previous : null;
  return (
    <ChartCard
      style={style}
      title="Spending pace"
      subtitle={
        last && sameDayPrev != null
          ? `${formatKr(last.current!)} by day ${last.day} · ${formatKr(sameDayPrev)} in ${prev} by then`
          : 'Cumulative spend through the period'
      }
      legend={[
        { label: prev, color: colors.context, kind: 'line' },
        { label: cur, color: colors.expense, kind: 'line' },
      ]}
      table={{
        columns: ['Day', cur, prev],
        rows: data.pace
          .filter((p) => p.day % 5 === 0 || p.day === 1 || p.day === data.pace.length)
          .map((p) => [String(p.day), p.current != null ? formatKr(p.current) : '—', p.previous != null ? formatKr(p.previous) : '—']),
      }}
    >
      <LineChart
        xLabels={labels}
        axisLabels={[shortDate(data.from), shortDate(data.to)]}
        series={[
          { label: prev, color: colors.context, values: data.pace.map((p) => p.previous) },
          { label: cur, color: colors.expense, values: data.pace.map((p) => p.current) },
        ]}
        formatValue={formatKr}
        height={chartHeight}
      />
    </ChartCard>
  );
}

function TrendCard({ data, colors, style, chartHeight }: CardProps) {
  const series = [
    { label: 'Income', color: colors.income },
    { label: 'Expenses', color: colors.expense },
    { label: 'Saved', color: colors.aqua },
  ];
  return (
    <ChartCard
      style={style}
      title="Income, expenses & savings"
      subtitle={`Last ${data.trend.length} periods`}
      legend={series.map((s) => ({ ...s, kind: 'rect' as const }))}
      table={{
        columns: ['Period', 'Income', 'Expenses', 'Saved', 'Left over'],
        rows: data.trend.map((t) => [monthLong(t.period), formatKr(t.income), formatKr(t.expenses), formatKr(t.saved), `${t.net < 0 ? '−' : ''}${formatKr(t.net)}`]),
      }}
    >
      <ColumnChart
        groups={data.trend.map((t) => ({ label: monthShort(t.period), title: monthLong(t.period), values: [t.income, t.expenses, t.saved] }))}
        series={series}
        formatValue={formatKr}
        height={chartHeight}
      />
    </ChartCard>
  );
}

function CategoryCard({ data, style }: { data: Insights; style?: ViewStyle }) {
  const top = data.categories[0];
  return (
    <ChartCard
      style={style}
      title="Where it went"
      subtitle={top && top.spent > 0 ? `${categoryLabel(top.category)} leads with ${Math.round(top.share)}% of spending` : 'Spending by category'}
    >
      <BarList items={data.categories} />
    </ChartCard>
  );
}

function WeekdayCard({ data, colors, style, chartHeight = 120 }: CardProps) {
  const peak = data.weekdays.reduce((best, d, i) => (d.spent > data.weekdays[best].spent ? i : best), 0);
  const hasPeak = data.weekdays[peak].spent > 0;
  return (
    <ChartCard
      style={style}
      title="By day of week"
      subtitle={hasPeak ? `${WEEKDAY_PLURAL[data.weekdays[peak].day]} cost the most` : 'Spending by weekday'}
      table={{
        columns: ['Day', 'Spent', 'Count'],
        rows: data.weekdays.map((d) => [WEEKDAYS[d.day], formatKr(d.spent), String(d.count)]),
      }}
    >
      <ColumnChart
        groups={data.weekdays.map((d) => ({ label: WEEKDAYS[d.day], title: WEEKDAY_PLURAL[d.day], values: [d.spent] }))}
        series={[{ label: 'Spent', color: colors.expense }]}
        colorFor={(g) => (hasPeak && g === peak ? colors.expense : colors.context)}
        labelGroup={hasPeak ? peak : undefined}
        formatValue={formatKr}
        height={chartHeight}
      />
    </ChartCard>
  );
}

function BudgetCard({ data, colors }: { data: Insights; colors: ChartColors }) {
  const theme = useTheme();
  const b = data.budget!;
  const ratio = b.totalBudget > 0 ? b.spent / b.totalBudget : 0;
  const severity = ratio > 1 ? colors.critical : ratio >= 0.8 ? colors.warning : colors.good;
  const onTrack = b.budgetedCount - b.overCount - b.nearCount;
  return (
    <ChartCard title="Budget health" subtitle={`${formatKr(b.spent)} of ${formatKr(b.totalBudget)} across ${b.budgetedCount} budgets`}>
      <Meter ratio={ratio} color={severity} height={10} />
      <Text style={[styles.meterCaption, { color: theme.textSecondary }]}>{Math.round(ratio * 100)}% used</Text>
      <View style={styles.statusRow}>
        <StatusChip icon="checkmark-circle" color={colors.good} label={`${onTrack} on track`} />
        <StatusChip icon="alert-circle" color={colors.warning} label={`${b.nearCount} close`} />
        <StatusChip icon="close-circle" color={colors.critical} label={`${b.overCount} over`} />
      </View>
    </ChartCard>
  );
}

function SourcesCard({ data, colors, style }: CardProps) {
  const count = (s: string) => data.sources.find((x) => x.source === s)?.count ?? 0;
  return (
    <ChartCard style={style} title="How you log" subtitle={`${data.summary.transactionCount} transactions this period`}>
      <StackedBar
        segments={[
          { label: 'Chat', value: count('CHAT'), color: colors.income },
          { label: 'Voice', value: count('VOICE'), color: colors.expense },
          { label: 'Manual', value: count('LEDGER'), color: colors.violet },
        ]}
        formatValue={(v) => String(v)}
      />
    </ChartCard>
  );
}

function TopExpensesCard({ data, style, wide }: { data: Insights; style?: ViewStyle; wide?: boolean }) {
  const theme = useTheme();
  if (data.topExpenses.length === 0) return null;
  return (
    <ChartCard style={style} title="Largest expenses" subtitle={`Top ${data.topExpenses.length} this period`}>
      {data.topExpenses.map((t, i) => {
        const meta = categoryMeta(t.category);
        return (
          <View key={t.id} style={[styles.txRow, i > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <View style={[styles.txIcon, { backgroundColor: meta.color + '1F' }]}>
              <Ionicons name={meta.icon} size={15} color={meta.color} />
            </View>
            {wide ? (
              <>
                <Text style={[styles.txDesc, styles.txDescWide, { color: theme.text }]} numberOfLines={1}>{t.description}</Text>
                <Text style={[styles.txCol, { color: theme.textSecondary }]} numberOfLines={1}>{categoryLabel(t.category)}</Text>
                <Text style={[styles.txCol, { color: theme.muted }]}>{shortDate(t.date)}</Text>
              </>
            ) : (
              <View style={{ flex: 1 }}>
                <Text style={[styles.txDesc, { color: theme.text }]} numberOfLines={1}>{t.description}</Text>
                <Text style={[styles.txMeta, { color: theme.muted }]}>{shortDate(t.date)} · {categoryLabel(t.category)}</Text>
              </View>
            )}
            <Text style={[styles.txAmt, wide && styles.txAmtWide, { color: theme.text }]}>{formatKr(t.amount)}</Text>
          </View>
        );
      })}
    </ChartCard>
  );
}

function EmptyCard({ style }: { style?: ViewStyle }) {
  const theme = useTheme();
  return (
    <View style={[styles.emptyCard, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }, style]}>
      <Image source={illustrations.empty.source} style={styles.emptyArt} resizeMode="contain" />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>No transactions this period</Text>
      <Text style={[styles.emptyText, { color: theme.muted }]}>
        Log a few with Voice or Chanakya and your charts will fill in.
      </Text>
    </View>
  );
}

// --- building blocks ------------------------------------------------------------------------

interface CardProps {
  data: Insights;
  colors: ChartColors;
  style?: ViewStyle;
  chartHeight?: number;
}

/** A row of equal-height cells (cards stretch to the tallest). */
function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Cell({ flex = 1, children }: { flex?: number; children: React.ReactNode }) {
  return <View style={{ flex, minWidth: 0 }}>{children}</View>;
}

function StatusChip({ icon, color, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; label: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.chip, { borderColor: theme.border }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.chipText, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

// --- derived metrics ------------------------------------------------------------------------

function prevPeriod(period: string): string {
  const p = shiftPeriod(parsePeriodParam(period), -1);
  return `${p.year}-${String(p.month).padStart(2, '0')}`;
}

function pctDelta(cur: number, prev: number, upIsGood: boolean, suffix: string): Delta | null {
  if (!prev) return null;
  const change = (cur - prev) / prev;
  const direction = Math.abs(change) < 0.005 ? 'flat' : change > 0 ? 'up' : 'down';
  return {
    text: `${Math.round(Math.abs(change) * 100)}% ${suffix}`,
    direction,
    good: direction === 'flat' ? null : (direction === 'up') === upIsGood,
  };
}

function amountDelta(cur: number, prev: number, upIsGood: boolean, suffix: string): Delta | null {
  const diff = cur - prev;
  if (prev === 0 && cur === 0) return null;
  const direction = Math.abs(diff) < 1 ? 'flat' : diff > 0 ? 'up' : 'down';
  return {
    text: `${formatCompact(diff)} kr ${suffix}`,
    direction,
    good: direction === 'flat' ? null : (direction === 'up') === upIsGood,
  };
}

function pointDelta(cur: number, prev: number, suffix: string): Delta {
  const diff = cur - prev;
  const direction = Math.abs(diff) < 0.5 ? 'flat' : diff > 0 ? 'up' : 'down';
  return { text: `${Math.round(Math.abs(diff))} pts ${suffix}`, direction, good: direction === 'flat' ? null : diff > 0 };
}

interface Highlight {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone: 'good' | 'bad' | 'neutral';
  text: string;
}

/** Plain-language observations derived from the insights payload, most useful first. */
function buildHighlights(d: Insights): Highlight[] {
  const out: Highlight[] = [];
  const { summary: s, previous: p } = d;
  const prevName = monthShort(prevPeriod(d.period));
  const inProgress = d.daysElapsed > 0 && d.daysElapsed < d.daysInPeriod;

  // Pace vs last period.
  if (p.expenses > 0 && s.expenses > 0) {
    const basis = inProgress ? s.projectedExpenses : s.expenses;
    const change = basis / p.expenses - 1;
    if (Math.abs(change) >= 0.05) {
      const pct = Math.round(Math.abs(change) * 100);
      out.push({
        icon: change > 0 ? 'trending-up' : 'trending-down',
        tone: change > 0 ? 'bad' : 'good',
        text: inProgress
          ? `At this pace you'll spend about ${formatKr(basis)}, ${pct}% ${change > 0 ? 'more' : 'less'} than ${prevName}.`
          : `You spent ${pct}% ${change > 0 ? 'more' : 'less'} than in ${prevName}.`,
      });
    }
  }

  // Biggest category mover.
  const mover = d.categories
    .filter((c) => c.previousSpent > 0)
    .sort((a, b) => Math.abs(b.spent - b.previousSpent) - Math.abs(a.spent - a.previousSpent))[0];
  if (mover && Math.abs(mover.spent - mover.previousSpent) >= 100) {
    const up = mover.spent > mover.previousSpent;
    const pct = Math.round((Math.abs(mover.spent - mover.previousSpent) / mover.previousSpent) * 100);
    out.push({
      icon: categoryMeta(mover.category).icon,
      tone: up ? 'bad' : 'good',
      text: `${categoryLabel(mover.category)} is ${up ? 'up' : 'down'} ${pct}% vs ${prevName} (${up ? '+' : '−'}${formatKr(mover.spent - mover.previousSpent)}).`,
    });
  }

  // Savings.
  if (s.income > 0) {
    if (s.net < 0) {
      out.push({ icon: 'warning-outline', tone: 'bad', text: `Spending and savings are ${formatKr(s.net)} more than your income this period.` });
    } else if (s.saved > 0) {
      out.push({
        icon: 'shield-checkmark-outline',
        tone: 'good',
        text: `You've set aside ${formatKr(s.saved)} — ${Math.round(s.savingsRate ?? 0)}% of your income.`,
      });
    } else if (s.net > 0) {
      out.push({ icon: 'leaf-outline', tone: 'neutral', text: `${formatKr(s.net)} left over — consider moving some to savings.` });
    }
  }

  // Budgets.
  const over = d.categories.filter((c) => c.budget != null && c.spent > c.budget);
  if (over.length > 0) {
    out.push({
      icon: 'alert-circle-outline',
      tone: 'bad',
      text: over.length === 1
        ? `${categoryLabel(over[0].category)} is ${formatKr(over[0].spent - over[0].budget!)} over budget.`
        : `${over.length} categories are over budget.`,
    });
  }

  return out.slice(0, 4);
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  contentWide: { padding: 24, paddingBottom: 40, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  stack: { gap: 16 },
  fill: { flexGrow: 1 },
  row: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  hero: { borderRadius: 22, padding: 20, justifyContent: 'space-between', boxShadow: '0px 10px 24px rgba(230, 81, 0, 0.25)' },
  heroLabel: { color: '#fff', fontSize: 12, fontWeight: '600', opacity: 0.85, textTransform: 'uppercase', letterSpacing: 0.8 },
  heroValue: { color: '#fff', fontSize: 48, fontWeight: '800', letterSpacing: -1, marginTop: 2 },
  heroSub: { color: '#fff', fontSize: 14, opacity: 0.92 },
  heroMeterRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  heroDays: { color: '#fff', fontSize: 12, fontWeight: '600', opacity: 0.9 },
  kpiGrid: { gap: 10 },
  kpiRow: { flexDirection: 'row', gap: 10, flexGrow: 1 },
  highlights: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 10 },
  highlightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  highlightsTitle: { fontSize: 15, fontWeight: '700' },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  highlightIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  highlightText: { flex: 1, fontSize: 13, lineHeight: 19 },
  meterCaption: { fontSize: 12, marginTop: 6 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 12, fontWeight: '500' },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  txIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  txDesc: { fontSize: 14, fontWeight: '600' },
  txDescWide: { flex: 2 },
  txCol: { flex: 1, fontSize: 13, textTransform: 'capitalize' },
  txMeta: { fontSize: 11, marginTop: 1, textTransform: 'capitalize' },
  txAmt: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  txAmtWide: { width: 110, textAlign: 'right' },
  empty: { alignItems: 'center', marginTop: 60, gap: 10 },
  emptyCard: { borderWidth: 1, borderRadius: 18, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 6 },
  emptyArt: { width: 180, height: 180 / illustrations.empty.aspectRatio },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptyText: { fontSize: 13, textAlign: 'center' },
});
