import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

console.log('[RootLayout] Mounting');

/**
 * Root layout - minimal test version
 */
export default function RootLayout(): React.JSX.Element {
  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Text style={{ fontSize: 20, color: '#111827', padding: 20 }}>
        Root Layout Loaded
      </Text>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
