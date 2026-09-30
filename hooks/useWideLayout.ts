import { Platform, useWindowDimensions } from 'react-native';
import { useClientOnlyValue } from '../components/useClientOnlyValue';

// Browser windows at least this wide get the desktop layout (sidebar + centered content).
export const WIDE_BREAKPOINT = 768;
// Max width of the main content column on desktop (the dashboard opts out and uses the full width).
export const CONTENT_MAX_WIDTH = 760;
// Width of the desktop sidebar tab bar.
export const SIDEBAR_WIDTH = 220;

/**
 * True on web when the window is desktop-sized. Always false on native.
 * Starts false during static rendering (no window on the server), then updates on the client.
 */
export function useWideLayout(): boolean {
  const { width } = useWindowDimensions();
  return useClientOnlyValue(false, Platform.OS === 'web' && width >= WIDE_BREAKPOINT);
}
