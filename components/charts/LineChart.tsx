import React, { useState } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useThemeColor';
import { useChartColors } from '../../constants/chartColors';
import { formatCompact, niceScale } from '../../constants/format';

export interface LineSeries {
  label: string;
  color: string;
  values: (number | null)[]; // one per x; null = no data (line stops)
}

interface LineChartProps {
  xLabels: string[];               // tooltip label per x
  axisLabels?: [string, string];   // first / last x-axis label
  series: LineSeries[];            // drawn in order; put the emphasized series last
  formatValue: (v: number) => string;
  height?: number;
}

const Y_AXIS = 40;
const X_AXIS = 22;
const TOOLTIP_W = 150;

/**
 * Multi-series line chart drawn with plain Views (no SVG): each segment is a 2px bar rotated
 * between two points. A crosshair snaps to the nearest x on hover (web) or touch/drag (native)
 * and a single tooltip lists every series at that x.
 */
export function LineChart({ xLabels, axisLabels, series, formatValue, height = 170 }: LineChartProps) {
  const theme = useTheme();
  const colors = useChartColors();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);

  const n = xLabels.length;
  const peak = Math.max(0, ...series.flatMap((s) => s.values.map((v) => v ?? 0)));
  const { max, step } = niceScale(peak);
  const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);

  const plotW = Math.max(width - Y_AXIS, 1);
  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * plotW);
  const y = (v: number) => height - (v / max) * height;

  const pick = (px: number) => {
    if (n === 0) return;
    const i = Math.round((Math.max(0, Math.min(px, plotW)) / plotW) * (n - 1));
    setActive(i);
  };

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={{ height: height + X_AXIS }}>
      {width > 0 && (
        <>
          {/* Y ticks + hairline grid */}
          {ticks.map((t) => (
            <View key={t} style={[styles.gridRow, { top: y(t) }]}>
              <Text style={[styles.tick, { color: theme.muted }]}>{formatCompact(t)}</Text>
              <View style={[styles.gridLine, { backgroundColor: t === 0 ? theme.border : colors.grid }]} />
            </View>
          ))}

          <View style={[styles.plot, { left: Y_AXIS, width: plotW, height }]}>
            {series.map((s) => (
              <React.Fragment key={s.label}>
                {s.values.map((v, i) => {
                  const next = s.values[i + 1];
                  if (v == null || next == null) return null;
                  const x1 = x(i), y1 = y(v), x2 = x(i + 1), y2 = y(next);
                  const len = Math.hypot(x2 - x1, y2 - y1);
                  const angle = Math.atan2(y2 - y1, x2 - x1);
                  return (
                    <View
                      key={i}
                      style={{
                        position: 'absolute',
                        left: (x1 + x2) / 2 - len / 2,
                        top: (y1 + y2) / 2 - 1,
                        width: len + 1, // overlap by 1px so joins stay round-looking
                        height: 2,
                        borderRadius: 1,
                        backgroundColor: s.color,
                        transform: [{ rotate: `${angle}rad` }],
                      }}
                    />
                  );
                })}
                <EndDot series={s} x={x} y={y} surface={theme.card} />
              </React.Fragment>
            ))}

            {active != null && (
              <>
                <View style={[styles.crosshair, { left: x(active), height, backgroundColor: theme.muted }]} />
                {series.map((s) =>
                  s.values[active] != null ? (
                    <View
                      key={s.label}
                      style={[styles.dot, { left: x(active) - 6, top: y(s.values[active]!) - 6, backgroundColor: s.color, borderColor: theme.card }]}
                    />
                  ) : null,
                )}
              </>
            )}
          </View>

          {/* X axis labels */}
          {axisLabels && (
            <View style={[styles.xAxis, { left: Y_AXIS, width: plotW, top: height + 6 }]}>
              <Text style={[styles.xTick, { color: theme.muted }]}>{axisLabels[0]}</Text>
              <Text style={[styles.xTick, { color: theme.muted }]}>{axisLabels[1]}</Text>
            </View>
          )}

          {/* Tooltip */}
          {active != null && (
            <View
             
              style={[
                styles.tooltip,
                {
                  left: Y_AXIS + Math.max(0, Math.min(x(active) - TOOLTIP_W / 2, plotW - TOOLTIP_W)),
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={[styles.tooltipTitle, { color: theme.textSecondary }]}>{xLabels[active]}</Text>
              {[...series].reverse().map((s) => (
                <View key={s.label} style={styles.tooltipRow}>
                  <View style={[styles.tooltipKey, { backgroundColor: s.color }]} />
                  <Text style={[styles.tooltipValue, { color: theme.text }]}>
                    {s.values[active] != null ? formatValue(s.values[active]!) : '—'}
                  </Text>
                  <Text style={[styles.tooltipLabel, { color: theme.muted }]} numberOfLines={1}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Hit layer: on top of everything so event coordinates are relative to the plot. */}
          <View
            style={[styles.hit, { left: Y_AXIS, width: plotW, height }]}
            onStartShouldSetResponder={() => true}
            onResponderGrant={(e) => pick(e.nativeEvent.locationX)}
            onResponderMove={(e) => pick(e.nativeEvent.locationX)}
            onResponderTerminationRequest={() => true}
            {...(Platform.OS === 'web'
              ? {
                  onPointerMove: (e: any) => pick(e.nativeEvent.offsetX),
                  onPointerLeave: () => setActive(null),
                }
              : {})}
          />
        </>
      )}
    </View>
  );
}

/** Filled >=8px marker with a 2px surface ring at the series' last value. */
function EndDot({ series, x, y, surface }: { series: LineSeries; x: (i: number) => number; y: (v: number) => number; surface: string }) {
  let last = -1;
  series.values.forEach((v, i) => { if (v != null) last = i; });
  if (last < 0) return null;
  return (
    <View
      style={[styles.dot, { left: x(last) - 6, top: y(series.values[last]!) - 6, backgroundColor: series.color, borderColor: surface }]}
    />
  );
}

const styles = StyleSheet.create({
  gridRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', height: 0, pointerEvents: 'none' },
  tick: { fontSize: 10, width: Y_AXIS - 6, fontVariant: ['tabular-nums'] },
  xTick: { fontSize: 10 },
  gridLine: { flex: 1, height: StyleSheet.hairlineWidth },
  plot: { position: 'absolute', top: 0, pointerEvents: 'none' },
  crosshair: { position: 'absolute', top: 0, width: StyleSheet.hairlineWidth },
  dot: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  xAxis: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', pointerEvents: 'none' },
  hit: { position: 'absolute', top: 0 },
  tooltip: {
    position: 'absolute',
    pointerEvents: 'none',
    top: -6,
    width: TOOLTIP_W,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 3,
    boxShadow: '0px 4px 14px rgba(0, 0, 0, 0.12)',
  },
  tooltipTitle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipKey: { width: 10, height: 2, borderRadius: 1 },
  tooltipValue: { fontSize: 13, fontWeight: '700' },
  tooltipLabel: { fontSize: 11, flexShrink: 1 },
});
