import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme';
import { useMobileAuthStore } from '../../src/stores/authStore';

const t = theme;

/**
 * Tab bar layout with Dashboard, Jobs, Applications, and Profile tabs.
 */
export default function TabsLayout(): React.JSX.Element {
  const role = useMobileAuthStore((s) => s.role);
  const isCompany = role === 'COMPANY';
  const isAdmin = role === 'ADMIN';
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: t.colors.primary,
        tabBarInactiveTintColor: t.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          ...t.shadows.elevated,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: isAdmin ? 'Admin' : 'Dashboard',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarLabel: isAdmin ? 'Queue' : isCompany ? 'Manage Jobs' : 'Jobs',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          tabBarLabel: isAdmin ? 'Audit' : isCompany ? 'Applicants' : 'Applied',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: isAdmin ? 'Admin Profile' : isCompany ? 'Company' : 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
