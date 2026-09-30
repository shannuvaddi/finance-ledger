import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MeterProps {
  ratio: number;   // 0..1+ (clamped for drawing)
  color: string;   // fill carries severity
  track?: string;  // defaults to a lighter step of the fill
  height?: number;
}

/** A single ratio against a limit. The track is a lighter step of the fill's own hue. */
export function Meter({ ratio, color, track, height = 8 }: MeterProps) {
  const pct = Math.max(0, Math.min(ratio, 1)) * 100;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track ?? color + '33' }]}>
      <View style={{ width: `${pct}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%' },
});
