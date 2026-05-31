import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

const t = theme;

export default function CompanyLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: t.colors.primary,
        headerStyle: { backgroundColor: t.colors.surface },
        headerTitleStyle: { fontWeight: '700', color: t.colors.textPrimary },
        headerShadowVisible: false,
      }}
    />
  );
}
