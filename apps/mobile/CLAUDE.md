# apps/mobile: Expo app

Expo SDK 58, React Native 0.88, Expo Router, TypeScript strict. Rules for UI work load from
`.claude/rules/mobile-ui.md`. Design source: [design brief](../../docs/product/design-brief.md) + Penpot.

## Commands

```bash
pnpm nx start mobile                 # Expo dev server (Expo Go: scan the QR code)
pnpm nx run mobile:run-ios           # native build on a simulator (needs Xcode)
pnpm nx test mobile                  # Jest (jest-expo) + React Native Testing Library
pnpm nx lint mobile && pnpm nx typecheck mobile
cd apps/mobile && pnpm exec expo install <pkg>   # add a dependency at the SDK-matched version
```

## Layout

```
src/app/          Expo Router routes. Thin files only: re-export a screen, set options.
src/screens/<name>/   Screen component + its *.spec.tsx (one folder per design-brief screen)
src/components/   Reusable UI pieces (create when the second screen needs one)
src/theme/        ThemeProvider + useTheme(); values come from @greetday/design-tokens
src/api/          API client; responses validated with @greetday/contracts schemas
```

**Never put tests or non-route files in `src/app/`.** Expo Router treats every file there as a route.

## Screens and routing

- Screen IDs from the design brief map to routes and folders: `S-03 Upcoming` →
  `src/app/upcoming.tsx` + `src/screens/upcoming/UpcomingScreen.tsx`. Put the ID in a one-line
  comment at the top of the screen file (`// S-03 Upcoming`).
- Use typed routes (`experiments.typedRoutes`): `router.push('/upcoming')`, `<Link href=…>`.
- Use the `/mobile-screen` skill (or its checklist) for every new screen.

## Every screen must handle

1. **Loading**: skeleton or spinner with an accessibility label.
2. **Empty**: the copy from the design brief, plus the primary action.
3. **Error**: a readable message and a retry action. Never show raw error text from the API.
4. **Success**: the actual content.

Each state gets a test.

## Styling

- **Tokens only.** Read colors, spacing, radii, font sizes and weights from `useTheme()`.
  No hex values, no magic numbers in styles (layout values like `flex: 1` are fine).
- If a token is missing, don't invent one. Ask, or hand off to `product-designer`, then run
  `/sync-design-tokens`. Never edit `libs/design-tokens/src/theme.ts` by hand.
- `StyleSheet.create` for static styles; inline only for token-driven values.

## Data

- Call the API through `src/api/client.ts` (`apiGet(path, schema)`), using schemas from
  `@greetday/contracts`. Never hand-write response types.
- `EXPO_PUBLIC_API_URL` sets the base URL. `EXPO_PUBLIC_*` values ship in the app bundle, so they
  must never hold secrets.
- Business rules (age, next birthday, Feb 29) live in `@greetday/domain`, not in components.
- Never import `@greetday/db` (lint fails).

## Gotchas

- Path alias `@/*` → `src/*` is declared in `tsconfig.json` (Metro reads it there) and in the
  app/spec tsconfigs and `jest.config.cts`. Keep them in sync.
- Expo Go only runs the latest SDK. After an Expo upgrade, run `pnpm exec expo install --check`.
