import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useThemeColor';
import { useChartColors } from '../../constants/chartColors';
import { formatCompact, niceScale } from '../../constants/format';

export interface ColumnGroup {
  label: string;        // x-axis label
  title?: string;       // tooltip heading (defaults to label)
  values: number[];     // one per series
}

interface ColumnChartProps {
  groups: ColumnGroup[];
  series: { label: string; color: string }[];
  /** Per-bar color override, e.g. to emphasize one column and gray the rest. */
  colorFor?: (group: number, series: number) => string;
  /** Group whose value is labeled on the cap (single-series charts only). */
  labelGroup?: number;
  formatValue: (v: number) => string;
  height?: number;
}

const Y_AXIS = 40;
const X_AXIS = 22;
const BAR_MAX = 24;
const GAP = 2;
const TOOLTIP_W = 150;

/** Grouped column chart: <=24px bars, 4px rounded caps, 2px surface gap, per-group hover/tap readout. */
export function ColumnChart({ groups, series, colorFor, labelGroup, formatValue, height = 150 }: ColumnChartProps) {
  const theme = useTheme();
  const colors = useChartColors();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const peak = Math.max(0, ...groups.flatMap((g) => g.values));
  const { max, step } = niceScale(peak);
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
  const y = (v: number) => height - (v / max) * height;

  const plotW = Math.max(width - Y_AXIS, 1);
  const slot = plotW / Math.max(groups.length, 1);
  const barW = Math.max(4, Math.min(BAR_MAX, (slot * 0.7 - GAP * (series.length - 1)) / series.length));
  const groupW = barW * series.length + GAP * (series.length - 1);

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)} style={{ height: height + X_AXIS }}>
      {width > 0 && (
        <>
          {ticks.map((t) => (
            <View key={t} style={[styles.gridRow, { top: y(t) }]}>
              <Text style={[styles.tick, { color: theme.muted }]}>{formatCompact(t)}</Text>
              <View style={[styles.gridLine, { backgroundColor: t === 0 ? theme.border : colors.grid }]} />
            </View>
          ))}

          {groups.map((g, gi) => {
            const dim = active != null && active !== gi;
            const left = Y_AXIS + gi * slot;
            return (
              <Pressable
                key={g.label + gi}
                style={[styles.slot, { left, width: slot, height: height + X_AXIS }]}
                onPress={() => setActive(active === gi ? null : gi)}
                onHoverIn={() => setActive(gi)}
                onHoverOut={() => setActive((a) => (a === gi ? null : a))}
                accessibilityRole="button"
                accessibilityLabel={`${g.title ?? g.label}: ${series.map((s, si) => `${s.label} ${formatValue(g.values[si])}`).join(', ')}`}
              >
                <View style={[styles.bars, { height, width: groupW, marginLeft: (slot - groupW) / 2, gap: GAP }]}>
                  {g.values.map((v, si) => (
                    <View
                      key={si}
                      style={{
                        width: barW,
                        height: v > 0 ? Math.max(2, (v / max) * height) : 0,
                        backgroundColor: colorFor ? colorFor(gi, si) : series[si].color,
                        borderTopLeftRadius: Math.min(4, barW / 2),
                        borderTopRightRadius: Math.min(4, barW / 2),
                        opacity: dim ? 0.4 : 1,
                      }}
                    />
                  ))}
                </View>
                {labelGroup === gi && g.values[0] > 0 && active == null && (
                  <Text style={[styles.capLabel, { top: y(g.values[0]) - 16, color: theme.text }]}>
                    {formatCompact(g.values[0])}
                  </Text>
                )}
                <Text style={[styles.xLabel, { color: active === gi ? theme.text : theme.muted }]} numberOfLines={1}>
                  {g.label}
                </Text>
              </Pressable>
            );
          })}

          {active != null && (
            <View
              style={[
                styles.tooltip,
                {
                  left: Y_AXIS + Math.max(0, Math.min(active * slot + slot / 2 - TOOLTIP_W / 2, plotW - TOOLTIP_W)),
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.tooltipTitle, { color: theme.textSecondary }]}>
                {groups[active].title ?? groups[active].label}
              </Text>
              {series.map((s, si) => (
                <View key={s.label} style={styles.tooltipRow}>
                  <View style={[styles.tooltipKey, { backgroundColor: colorFor ? colorFor(active, si) : s.color }]} />
                  <Text style={[styles.tooltipValue, { color: theme.text }]}>{formatValue(groups[active].values[si])}</Text>
                  <Text style={[styles.tooltipLabel, { color: theme.muted }]} numberOfLines={1}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  gridRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', height: 0, pointerEvents: 'none' },
  tick: { fontSize: 10, width: Y_AXIS - 6, fontVariant: ['tabular-nums'] },
  gridLine: { flex: 1, height: StyleSheet.hairlineWidth },
  slot: { position: 'absolute', top: 0 },
  bars: { flexDirection: 'row', alignItems: 'flex-end' },
  capLabel: { position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  xLabel: { fontSize: 10, textAlign: 'center', marginTop: 6 },
  tooltip: {
    position: 'absolute',
    top: -6,
    width: TOOLTIP_W,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
    pointerEvents: 'none',
    boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.12)',
  },
  tooltipTitle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipKey: { width: 8, height: 8, borderRadius: 2 },
  tooltipValue: { fontSize: 13, fontWeight: '700' },
  tooltipLabel: { fontSize: 11, flexShrink: 1 },
});
