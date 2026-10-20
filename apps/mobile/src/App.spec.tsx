import { render, screen } from '@testing-library/react-native';
import { App } from './App';

describe('App', () => {
  it('starts on the Home screen', async () => {
    await render(<App />);
    expect(await screen.findByRole('header', { name: 'GreetDay' })).toBeTruthy();
  });
});
