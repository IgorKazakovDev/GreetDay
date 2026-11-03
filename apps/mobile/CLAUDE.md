# apps/mobile: Expo app

Expo SDK 58, React Native 0.88, Expo Router (file-based routes, typed `href`; React Navigation underneath), TypeScript strict. Rules for UI work load from
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
index.ts              Entry point: imports ./src/config/env (validation first), then expo-router/entry
src/app/              Routes: every file here is a route. _layout.tsx = root layout (providers + <Stack>)
src/navigation/       navigationTheme.ts (our tokens mapped onto the router's colors)
src/screens/<name>/   Screen component + its *.spec.tsx (one folder per design-brief screen)
src/router.spec.tsx   Routing tests (renderRouter over src/app); route files get no tests of their own
src/components/       Reusable UI pieces (create when the second screen needs one)
src/theme/            ThemeProvider + useTheme(); values come from @greetday/design-tokens
src/api/              API client; responses validated with @greetday/contracts schemas
src/config/           Build-time config, env.ts: the only place that reads EXPO_PUBLIC_*
```

## Screens and navigation

- Navigation is **Expo Router**, which works like the Next.js App Router: a file in `src/app/` is a
  route (`_layout.tsx` ≈ `layout.tsx`, `index.tsx` ≈ `page.tsx`, `[id].tsx` = dynamic segment,
  `(tabs)` = route group that adds no URL segment). Deep links (`greetday://…`) come from the file
  tree. Decision and reasons: [ADR 0005](../../docs/decisions/0005-expo-router-instead-of-react-navigation.md).
- **Every file in `src/app/` is a route**, so keep it thin: a route file only re-exports or renders
  a screen from `src/screens/`. Components, helpers and `*.spec.tsx` never go in `src/app/`.
- Screen IDs from the design brief map to routes and folders: `S-03 Upcoming` → route
  `src/app/upcoming.tsx` + `src/screens/upcoming/UpcomingScreen.tsx`. Put the ID in a one-line comment at the
  top of the screen file (`// S-03 Upcoming`).
- To add a screen: create `src/screens/<name>/<Name>Screen.tsx`, then a route file in `src/app/`
  that default-exports it (`export default UpcomingScreen;`, see `src/app/index.tsx`). A new tab or
  nested stack is a folder with its own `_layout.tsx`.
- Navigate with the typed `href`: `<Link href="/upcoming">` or `router.push('/upcoming')`
  (`useRouter()` from `expo-router`). A path that has no route file fails `pnpm nx typecheck mobile`.
- Params come from the URL, as in Next.js: `useLocalSearchParams<{ contactId: string }>()` in
  `src/app/contacts/[contactId].tsx` (values are strings). Pass ids in params, not whole objects; the
  screen loads its own data.
- Import router APIs (`Stack`, `Tabs`, `Link`, `useRouter`, `ThemeProvider`, `Theme`) from
  `expo-router`. It bundles React Navigation, so there are no direct `@react-navigation/*` deps.
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
- `EXPO_PUBLIC_API_URL` sets the base URL and `EXPO_PUBLIC_APP_ENV` the build environment; both are
  read only in `src/config/env.ts` (import `apiUrl` / `appEnv` from `@/config/env`). Values per EAS
  profile: [docs/environments.md](../../docs/environments.md). `EXPO_PUBLIC_*` values ship in the
  app bundle, so they must never hold secrets.
- Business rules (age, next birthday, Feb 29) live in `@greetday/domain`, not in components.
- Never import `@greetday/db` (lint fails).

## Gotchas

- Path alias `@/*` → `src/*` is declared in `tsconfig.json` (Metro reads it there) and in the
  app/spec tsconfigs and `jest.config.cts`. Keep them in sync.
- Tests of routing render the real route files with `renderRouter` from `expo-router/testing-library`
  (see `src/router.spec.tsx`). `react-native-safe-area-context` is mocked globally in
  `src/test-setup.ts` (otherwise `SafeAreaProvider` renders nothing in Jest).
- Typed routes need generated files (`.expo/types/router.d.ts`, `expo-env.d.ts`, git-ignored). The
  cached Nx target `mobile:typegen` makes them and `typecheck` depends on it, so just run
  `pnpm nx typecheck mobile`. `tsconfig.json` must keep them in `include` (else `href` degrades to
  `string`) and keep the `nx.sync.ignoredReferences` entry (else `nx sync:check` flip-flops).
- Navigation packages (`expo-router`, `react-native-screens`, `react-native-safe-area-context`) come
  from `pnpm exec expo install`, so they match the SDK.
- Expo Go only runs the latest SDK. After an Expo upgrade, run `pnpm exec expo install --check`.
