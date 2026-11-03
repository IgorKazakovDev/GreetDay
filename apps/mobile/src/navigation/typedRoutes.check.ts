import type { Href } from 'expo-router';

// Type-level guard (never imported at runtime): proves typed routes are generated and enforced.
// If the generated `.expo/types` stop being part of the program, `Href` widens to `string`, the
// directive below becomes unused, and typecheck fails.
export const home: Href = '/';

// @ts-expect-error: no route file for this path; fails if typed routes stop being generated
export const missing: Href = '/does-not-exist';
