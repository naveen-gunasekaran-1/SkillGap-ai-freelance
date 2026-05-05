import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function HomeScreen(): React.JSX.Element {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#111827' }}>SkillGap AI Mobile</Text>
      <Link href="/login" style={{ marginTop: 12, color: '#2563EB' }}>
        Go to login
      </Link>
    </View>
  );
}
