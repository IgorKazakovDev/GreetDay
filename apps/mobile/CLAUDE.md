# apps/mobile: Expo app

Expo SDK 58, React Native 0.88, React Navigation 7 (native stack), TypeScript strict. Rules for UI work load from
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
index.ts              Entry point: registerRootComponent(App)
src/App.tsx           Providers: SafeAreaProvider > ThemeProvider > NavigationContainer
src/navigation/       RootNavigator (native stack), types.ts (param lists), navigationTheme.ts
src/screens/<name>/   Screen component + its *.spec.tsx (one folder per design-brief screen)
src/components/       Reusable UI pieces (create when the second screen needs one)
src/theme/            ThemeProvider + useTheme(); values come from @greetday/design-tokens
src/api/              API client; responses validated with @greetday/contracts schemas
```

## Screens and navigation

- Navigation is **React Navigation 7 with the component ("dynamic") API**: navigators are components
  (`<RootStack.Navigator>`, `<RootStack.Screen>`) registered in `src/navigation/RootNavigator.tsx`.
- Screen IDs from the design brief map to route names and folders: `S-03 Upcoming` → route
  `Upcoming` + `src/screens/upcoming/UpcomingScreen.tsx`. Put the ID in a one-line comment at the
  top of the screen file (`// S-03 Upcoming`).
- To add a screen: add its params to `RootStackParamList` in `src/navigation/types.ts`
  (`Upcoming: undefined`, or `ContactDetail: { contactId: string }`), then add a `<RootStack.Screen>`.
- Type screen props with `RootStackScreenProps<'Upcoming'>`. `useNavigation()` is typed globally
  (module augmentation in `RootNavigator.tsx`), so `navigation.navigate('Upcoming')` is checked.
- Pass ids in params, not whole objects; the screen loads its own data.
- A new navigator (tabs, a nested stack) gets its own file in `src/navigation/` and its own param list.
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
- Tests render real navigators. `react-native-safe-area-context` is mocked globally in
  `src/test-setup.ts` (otherwise `SafeAreaProvider` renders nothing in Jest).
- Navigation packages come from `pnpm exec expo install`, so `react-native-screens` and
  `react-native-safe-area-context` match the SDK.
- Expo Go only runs the latest SDK. After an Expo upgrade, run `pnpm exec expo install --check`.
