jest.mock('expo/src/winter/ImportMetaRegistry', () => ({
  ImportMetaRegistry: {
    get url() {
      return null;
    },
  },
}));

// Expo SDK 55+ installs lazy winter-runtime globals (fetch, URL, etc.) that
// require files Jest treats as "outside of the scope of the test code" in a
// monorepo. Replace them with the runtime's own globals so the lazy getters
// never fire during tests.
const defineGlobal = (name: string, value: unknown) => {
  try {
    Object.defineProperty(global, name, {
      value,
      configurable: true,
      writable: true,
    });
  } catch {
    // Ignore environments that don't allow redefining these globals.
  }
};
defineGlobal('fetch', globalThis.fetch);
defineGlobal('Headers', globalThis.Headers);
defineGlobal('Request', globalThis.Request);
defineGlobal('Response', globalThis.Response);
defineGlobal('FormData', globalThis.FormData);
defineGlobal('URL', globalThis.URL);
defineGlobal('URLSearchParams', globalThis.URLSearchParams);

if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (object) => JSON.parse(JSON.stringify(object));
}

// SafeAreaProvider renders nothing until it has measured the device, which never happens in Jest.
// The library ships this mock (fixed frame and insets) for tests.
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

// src/config/env.ts throws when EXPO_PUBLIC_API_URL is missing, and tests must not depend on a
// developer's local root env file. Same values as .env.example.
process.env.EXPO_PUBLIC_API_URL ??= 'http://localhost:3000';
process.env.EXPO_PUBLIC_APP_ENV ??= 'development';
