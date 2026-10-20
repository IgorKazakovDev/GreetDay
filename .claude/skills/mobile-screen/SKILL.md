---
name: mobile-screen
description: Creates or rebuilds a React Navigation screen from a design-brief screen ID (e.g. S-03) with loading, empty, error and success states, theme tokens only, accessibility labels and a component test. Use whenever a screen is added to apps/mobile.
argument-hint: '<screen-id, e.g. S-03>'
---

# Mobile screen from a design-brief ID

Read `apps/mobile/CLAUDE.md` and `.claude/rules/mobile-ui.md`. Templates: [template.md](template.md).

1. **Find the screen** `$ARGUMENTS` in `docs/product/design-brief.md`: name, purpose, states, copy,
   navigation. Look at the Penpot board `<ID> <Name>` (read-only) for layout. If a state or copy
   is missing from the brief, ask before inventing it.
2. **Data:** which contract from `@greetday/contracts` it shows; which API call (`src/api/client.ts`).
   Missing endpoint → hand off to `backend-developer` and build against the contract.
   Derived values (age, days until birthday) come from `@greetday/domain`.
3. **Files:**
   - `src/screens/<name>/<Name>Screen.tsx`, starting with `// <ID> <Name>`
   - `src/screens/<name>/<Name>Screen.spec.tsx`
   - Register it: params in `RootStackParamList` (`src/navigation/types.ts`), then a
     `<RootStack.Screen name="<Name>" component={<Name>Route} />` in `RootNavigator.tsx`
4. **States:** loading, empty, error (with retry), success. All copy from the brief.
5. **Styling:** `useTheme()` tokens only. Lists use `FlatList`/`SectionList`.
6. **Accessibility:** header role on the title, labels on every touchable and icon, 44 pt
   targets (`theme.size.touchTarget`).
7. **Tests:** one test per state, plus the main interaction (press → navigation/callback).
   Query by role/label/text.
8. Run `/verify`. Say whether you ran it on a device/simulator or only in tests.
