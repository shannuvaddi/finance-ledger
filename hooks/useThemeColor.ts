import { useColorScheme } from 'react-native';
import Colors from '../constants/Colors';

type Theme = typeof Colors.light;

export function useThemeColor(colorName: keyof Theme) {
  const scheme = useColorScheme();
  const key = scheme === 'light' ? 'light' : 'dark';
  return Colors[key][colorName];
}

export function useTheme(): Theme {
  const scheme = useColorScheme();
  const key = scheme === 'light' ? 'light' : 'dark';
  return Colors[key];
}
