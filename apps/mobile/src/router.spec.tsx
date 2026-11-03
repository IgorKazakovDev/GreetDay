import { join } from 'node:path';
import { renderRouter, screen } from 'expo-router/testing-library';

describe('Expo Router', () => {
  it('starts on the Home screen', async () => {
    // Loads the real route files from src/app, so a missing or misnamed file fails this test.
    await renderRouter(join(__dirname, 'app'));
    expect(await screen.findByRole('header', { name: 'GreetDay' })).toBeTruthy();
    expect(screen).toHavePathname('/');
  });
});
