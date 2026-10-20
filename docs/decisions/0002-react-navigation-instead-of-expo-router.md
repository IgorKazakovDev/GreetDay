# 0002. React Navigation instead of Expo Router

- **Status:** Accepted
- **Date:** 2026-10-20
- **Deciders:** Igor Kazakov (drafted by Claude Code)
- **Related:** supersedes the Expo Router choice in ADR 0001

## Context

The mobile app was scaffolded with Expo Router (file-based routes in `src/app/`). The developer is
a React web developer learning React Native, and wants to learn how navigation works in React
Native itself rather than through a file-system convention. Expo Router is built on top of React
Navigation, so React Navigation is the layer underneath either way.

## Options considered

### Option A: Keep Expo Router

- Pros: routes from the file tree (familiar from Next.js), deep links and typed routes for free,
  Expo's default for new apps.
- Cons: hides navigators, param lists and linking config behind conventions; every file in
  `src/app/` becomes a route (tests had to live elsewhere).

### Option B: React Navigation 7, static config API

- Pros: recommended by React Navigation; automatic TypeScript types and deep linking from one object.
- Cons: config objects instead of components; less of what most existing tutorials and code use.

### Option C: React Navigation 7, component ("dynamic") API

- Pros: navigators are React components you render, so it reads like React; param lists are typed
  by hand, which teaches how navigation state and params work; the most common style in existing
  code and tutorials.
- Cons: more TypeScript boilerplate; deep linking has to be configured separately when needed.

## Decision

We choose **Option C**: `@react-navigation/native` + `@react-navigation/native-stack`, with a
`RootStack` in `apps/mobile/src/navigation/RootNavigator.tsx`, params in
`src/navigation/types.ts`, and global typing of `useNavigation()` via module augmentation.
The entry point is `apps/mobile/index.ts` (`registerRootComponent(App)`).

## Consequences

- Positive: explicit, learnable navigation code; screens no longer have to avoid a routes folder.
- Negative: deep links (`greetday://…`) need a `linking` config on `NavigationContainer` when the
  first deep-link story arrives; adding a screen touches two files (param list + navigator).
- Follow-ups: tabs or nested stacks get their own navigator file and param list. Consider the
  static API later if the TypeScript boilerplate grows tiresome.
