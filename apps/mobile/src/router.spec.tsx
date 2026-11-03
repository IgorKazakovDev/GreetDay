import { join } from 'node:path';
import { renderRouter, screen } from 'expo-router/testing-library';

describe('Expo Router', () => {
  it('shows Home when the app opens at the root URL', async () => {
    // Loads the real route files from src/app, so a missing or misnamed file fails this test.
    await renderRouter(join(__dirname, 'app'), { initialUrl: '/' });
    expect(await screen.findByRole('header', { name: 'GreetDay' })).toBeTruthy();
    expect(screen).toHavePathname('/');
  });
});
