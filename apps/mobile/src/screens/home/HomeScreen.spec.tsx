import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen (placeholder)', () => {
  it('renders the app title as a header', async () => {
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <HomeScreen />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole('header', { name: 'GreetDay' })).toBeTruthy();
  });
});
