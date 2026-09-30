import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme, useWindowDimensions } from 'react-native';
import Colors from '../../constants/Colors';
import { CONTENT_MAX_WIDTH, SIDEBAR_WIDTH, useWideLayout } from '../../hooks/useWideLayout';

export default function TabLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'light' ? 'light' : 'dark'];
  const wide = useWideLayout();
  const { width } = useWindowDimensions();
  // On desktop web, pad the scene so content sits in a centered column next to the sidebar.
  const gutter = wide ? Math.max(24, (width - SIDEBAR_WIDTH - CONTENT_MAX_WIDTH) / 2) : 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarPosition: wide ? 'left' : 'bottom',
        tabBarLabelPosition: wide ? 'beside-icon' : undefined,
        tabBarActiveBackgroundColor: wide ? colors.accent + '18' : undefined,
        tabBarStyle: wide
          ? {
              backgroundColor: colors.card,
              borderRightColor: colors.border,
              borderRightWidth: 1,
              width: SIDEBAR_WIDTH,
              paddingTop: 24,
            }
          : {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingTop: 4,
            },
        sceneStyle: { backgroundColor: colors.background, paddingHorizontal: gutter },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          // Full-width on desktop: the dashboard lays out its own columns instead of the centered column.
          sceneStyle: { backgroundColor: colors.background },
          tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="all"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ color, size }) => <Ionicons name="pie-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="voice"
        options={{
          title: 'Voice',
          tabBarIcon: ({ color, size }) => <Ionicons name="mic-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Chanakya',
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
