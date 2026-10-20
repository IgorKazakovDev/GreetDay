import { render, screen } from '@testing-library/react-native';
import { HomeScreen } from './HomeScreen';

describe('HomeScreen (placeholder)', () => {
  it('renders the app title as a header', async () => {
    await render(<HomeScreen />);
    expect(screen.getByRole('header', { name: 'GreetDay' })).toBeTruthy();
  });
});
