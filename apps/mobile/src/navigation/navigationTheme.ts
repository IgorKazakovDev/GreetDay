import { DefaultTheme, type Theme } from 'expo-router';
import { tokens } from '@greetday/design-tokens';

/** Expo Router's (React Navigation's) own colors (screen background, headers, tab bars), mapped from our tokens. */
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: tokens.color.accent,
    background: tokens.color.background,
    card: tokens.color.surface,
    text: tokens.color.text.primary,
    notification: tokens.color.danger,
  },
};
