import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

// Placeholder until the first screen from the design brief (S-xx) is built.
export function HomeScreen() {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.color.background }]}>
      <View style={[styles.center, { padding: theme.space.lg, gap: theme.space.sm }]}>
        <Text
          accessibilityRole="header"
          style={{
            color: theme.color.text.primary,
            fontSize: theme.font.size.title,
            fontWeight: theme.font.weight.bold,
          }}
        >
          GreetDay
        </Text>
        <Text style={{ color: theme.color.text.secondary, fontSize: theme.font.size.body }}>
          Scaffolding is up. Screens arrive with the first stories.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
