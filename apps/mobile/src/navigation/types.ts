import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Every screen in the root stack and the params it receives (`undefined` = no params).
 * Add a screen here first, then register it in RootNavigator.
 * Must be a `type`, not an `interface` (a React Navigation requirement).
 */
export type RootStackParamList = {
  Home: undefined;
};

/** Props for a screen in the root stack: `navigation` and `route`, typed for that screen. */
export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;
