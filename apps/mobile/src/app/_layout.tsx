import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { navigationTheme } from '@/navigation/navigationTheme';
import { ThemeProvider } from '@/theme/ThemeProvider';

/**
 * Root layout, rendered around every route (like app/layout.tsx in Next.js). Providers from the
 * outside in:
 * - SafeAreaProvider: measures the notch and home indicator so screens can avoid them.
 * - ThemeProvider: our design tokens, read with useTheme().
 * - NavigationThemeProvider: Expo Router's own colors (screen background, headers), from our tokens.
 *   Aliased because both providers are called ThemeProvider.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationThemeProvider value={navigationTheme}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </NavigationThemeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
