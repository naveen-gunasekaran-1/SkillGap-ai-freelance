import { Stack } from 'expo-router';

/**
 * Root layout - Simple stack that allows all routes to be accessible
 * Groups (auth) and (tabs) are automatically discovered from folder structure
 * No forced auth redirects - users navigate naturally from home page
 */
export default function RootLayout(): React.JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        contentStyle: { backgroundColor: '#FFFFFF' },
      }}
    />
  );
}
