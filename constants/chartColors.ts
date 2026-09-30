import { useColorScheme } from 'react-native';

// Chart palette, validated with the dataviz palette checker (CVD separation, lightness band,
// contrast) against the card surface in each mode. Series slots are fixed by entity, never by rank.
const chartColors = {
  light: {
    expense: '#E65100',
    income: '#2a78d6',
    aqua: '#1baf7a',   // savings
    violet: '#4a3aa7',
    context: '#958171', // de-emphasis gray for "previous period" / non-highlighted marks
    grid: '#F0E4D8',
    good: '#0ca30c',
    warning: '#fab219',
    critical: '#d03b3b',
  },
  dark: {
    expense: '#E8651F',
    income: '#3987e5',
    aqua: '#199e70',
    violet: '#9085e9',
    context: '#9A948E',
    grid: '#3D2C1E',
    good: '#0ca30c',
    warning: '#fab219',
    critical: '#d03b3b',
  },
};

export type ChartColors = typeof chartColors.light;

export function useChartColors(): ChartColors {
  return chartColors[useColorScheme() === 'light' ? 'light' : 'dark'];
}
