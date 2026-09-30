import { Platform, ViewStyle } from 'react-native';

// A CSS linear-gradient as a View background, with no extra native module. React Native
// renders it through `experimental_backgroundImage`; react-native-web passes `backgroundImage`
// through to CSS. Pair it with a solid `backgroundColor` as the fallback.
export function linearGradient(from: string, to: string, angle = 135): ViewStyle {
  const css = `linear-gradient(${angle}deg, ${from}, ${to})`;
  return (Platform.OS === 'web' ? { backgroundImage: css } : { experimental_backgroundImage: css }) as ViewStyle;
}

// Soft, warm drop shadow for raised cards.
export const cardShadow: ViewStyle = { boxShadow: '0px 6px 18px rgba(120, 60, 20, 0.08)' };
