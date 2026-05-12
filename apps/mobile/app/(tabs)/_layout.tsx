import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { theme } from '../../src/theme';

const t = theme;

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 6 }}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={{ fontSize: 10, fontWeight: focused ? '600' : '400', color: focused ? t.colors.primary : t.colors.textSecondary, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

/**
 * Tab bar layout with Dashboard, Jobs, Applications, and Profile tabs.
 */
export default function TabsLayout(): React.JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          ...t.shadows.card,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="💼" label="Jobs" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="📋" label="Applied" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
