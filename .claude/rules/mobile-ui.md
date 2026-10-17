---
paths:
  - 'apps/mobile/**'
---

# Mobile UI rules

## Accessibility (every component, every screen)

- Every touchable has `accessibilityRole` and an `accessibilityLabel` that says what it does
  ("Mark Anna as greeted", not "Button"). Icon-only buttons always need a label.
- Touch targets are at least **44×44 pt**: use `theme.size.touchTarget` for `minHeight`/`minWidth`, or `hitSlop`.
- Headings use `accessibilityRole="header"`. Images are either decorative (`accessible={false}`) or labelled.
- Don't convey meaning by color alone; pair it with text or an icon.
- Respect Dynamic Type: don't set `allowFontScaling={false}`, and avoid fixed heights on text containers.
- Announce async results that change the screen (e.g. `AccessibilityInfo.announceForAccessibility`).

## Tokens only

- Colors, spacing, radii, typography come from `useTheme()` (generated from Penpot tokens).
  No hex/rgb literals, no numeric font sizes or spacing in styles.
- Missing token → stop and ask, or hand off to `product-designer`. Don't add ad-hoc constants.

## Lists and performance

- Any list that can grow (contacts, birthdays, history) uses `FlatList`/`SectionList` (virtualized),
  never `ScrollView` + `map`. Provide `keyExtractor` and stable item components (`React.memo` when the row is non-trivial).
- No inline arrow functions for `renderItem` on large lists; define them with `useCallback`.
- Images: set explicit sizes; prefer `expo-image` once images are introduced.

## States

Every screen renders loading, empty, error and success states. See `apps/mobile/CLAUDE.md`.

## Platform

- Wrap screens in `SafeAreaView` (from `react-native-safe-area-context`).
- Test on both iOS and Android sizes when layout matters; note in your summary if you only checked one.
