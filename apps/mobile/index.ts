// Validates EXPO_PUBLIC_* first, so a bad build fails at startup: a readable error in development,
// a crash with the message in the device logs in a release build. Imports run in order, so this
// is evaluated before Expo Router loads any route.
import './src/config/env';
// Registers the root component (Expo Router's <ExpoRoot> over the files in src/app). The web
// equivalent is the entry script of a Next.js app: the framework mounts the routes for us.
import 'expo-router/entry';
