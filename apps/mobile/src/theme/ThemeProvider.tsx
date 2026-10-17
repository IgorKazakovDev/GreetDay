import { createContext, useContext, type ReactNode } from 'react';
import { tokens, type Tokens } from '@greetday/design-tokens';

// Stub: a single light theme generated from Penpot tokens (libs/design-tokens).
// Dark mode and font loading come later; screens should only ever read values via useTheme().
const ThemeContext = createContext<Tokens>(tokens);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Tokens {
  return useContext(ThemeContext);
}
