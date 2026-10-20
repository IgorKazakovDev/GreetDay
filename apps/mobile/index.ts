import { registerRootComponent } from 'expo';
import { App } from './src/App';

// Tells React Native which component is the root of the app (like createRoot(...).render(<App />)
// on the web). registerRootComponent also sets up Expo's environment for Expo Go and native builds.
registerRootComponent(App);
