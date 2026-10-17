const { withNxMetro } = require('@nx/expo');
// Expo SDK 55+ ships Metro via `@expo/metro`. `getDefaultConfig` and
// `mergeConfig` must come from the Expo-provided Metro instance.
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@expo/metro/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { sourceExts } = defaultConfig.resolver;

/** @type {import('metro-config').MetroConfig} */
const customConfig = {
  cacheVersion: 'mobile',
  resolver: {
    sourceExts: [...sourceExts, 'cjs', 'mjs'],
  },
};

// withNxMetro lets Metro resolve workspace libs (libs/*) and watch them for changes.
module.exports = withNxMetro(mergeConfig(defaultConfig, customConfig), {
  debug: false,
  extensions: [],
  watchFolders: [],
});
