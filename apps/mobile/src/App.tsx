import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation/RootNavigator';
import { navigationTheme } from '@/navigation/navigationTheme';
import { ThemeProvider } from '@/theme/ThemeProvider';

/**
 * App root. Providers from the outside in:
 * - SafeAreaProvider: measures the notch and home indicator so screens can avoid them.
 * - ThemeProvider: our design tokens, read with useTheme().
 * - NavigationContainer: holds navigation state (like <BrowserRouter> on the web).
 */
export function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="auto" />
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
