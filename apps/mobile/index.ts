import { registerRootComponent } from 'expo';
// Validates EXPO_PUBLIC_* first, so a bad build fails at startup: a readable error in development,
// a crash with the message in the device logs in a release build.
import './src/config/env';
import { App } from './src/App';

// Tells React Native which component is the root of the app (like createRoot(...).render(<App />)
// on the web). registerRootComponent also sets up Expo's environment for Expo Go and native builds.
registerRootComponent(App);
