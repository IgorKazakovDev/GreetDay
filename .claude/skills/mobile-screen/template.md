# Mobile screen templates

## src/screens/upcoming/UpcomingScreen.tsx

```tsx
// S-03 Upcoming
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

type Item = { id: string; name: string };

export interface UpcomingScreenProps {
  state:
    | { status: 'loading' }
    | { status: 'error'; retry: () => void }
    | { status: 'success'; items: Item[] };
}

export function UpcomingScreen({ state }: UpcomingScreenProps) {
  const theme = useTheme();
  const text = { color: theme.color.text.primary, fontSize: theme.font.size.body };

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: theme.color.background }]}>
      <Text
        accessibilityRole="header"
        style={{ ...text, fontSize: theme.font.size.title, fontWeight: theme.font.weight.bold }}
      >
        Upcoming
      </Text>

      {state.status === 'loading' && (
        <ActivityIndicator accessibilityLabel="Loading upcoming birthdays" />
      )}

      {state.status === 'error' && (
        <View>
          <Text style={text}>Couldn't load birthdays.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retry loading birthdays"
            onPress={state.retry}
            style={{ minHeight: theme.size.touchTarget, justifyContent: 'center' }}
          >
            <Text style={{ ...text, color: theme.color.accent }}>Retry</Text>
          </Pressable>
        </View>
      )}

      {state.status === 'success' && (
        <FlatList
          data={state.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <Text style={text}>{item.name}</Text>}
          ListEmptyComponent={<Text style={text}>No birthdays in the next 30 days.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
```

## Registering it (src/navigation/types.ts + RootNavigator.tsx)

```tsx
// types.ts
export type RootStackParamList = {
  Home: undefined;
  Upcoming: undefined;
};

// RootNavigator.tsx, inside <RootStack.Navigator>
<RootStack.Screen name="Upcoming" component={UpcomingRoute} />;
```

`UpcomingRoute` (in `src/screens/upcoming/UpcomingRoute.tsx`) receives `RootStackScreenProps<'Upcoming'>`,
fetches data and passes it to `UpcomingScreen`'s `state` prop, which keeps the screen easy to test.
Navigate to it from anywhere with `navigation.navigate('Upcoming')` (`useNavigation()` is typed globally).

## src/screens/upcoming/UpcomingScreen.spec.tsx

```tsx
import { render, screen, userEvent } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UpcomingScreen } from './UpcomingScreen';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (props: Parameters<typeof UpcomingScreen>[0]) =>
  render(
    <SafeAreaProvider initialMetrics={metrics}>
      <UpcomingScreen {...props} />
    </SafeAreaProvider>,
  );

describe('UpcomingScreen', () => {
  it('shows a loading indicator while loading', async () => {
    await renderScreen({ state: { status: 'loading' } });
    expect(screen.getByLabelText('Loading upcoming birthdays')).toBeTruthy();
  });

  it('shows the empty message when there are no birthdays', async () => {
    await renderScreen({ state: { status: 'success', items: [] } });
    expect(screen.getByText('No birthdays in the next 30 days.')).toBeTruthy();
  });

  it('retries when the retry button is pressed after an error', async () => {
    const retry = jest.fn();
    await renderScreen({ state: { status: 'error', retry } });
    await userEvent.press(screen.getByRole('button', { name: 'Retry loading birthdays' }));
    expect(retry).toHaveBeenCalled();
  });

  it('lists birthdays on success', async () => {
    await renderScreen({ state: { status: 'success', items: [{ id: '1', name: 'Anna' }] } });
    expect(screen.getByText('Anna')).toBeTruthy();
  });
});
```
