import { Stack } from 'expo-router';
import { theme } from '../../src/theme';

const t = theme;

export default function ApplicationLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.surface },
        headerTintColor: t.colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: t.colors.background },
      }}
    />
  );
}
