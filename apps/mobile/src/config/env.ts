// Build-time configuration. Where each value comes from: docs/environments.md

export const APP_ENVS = ['development', 'preview', 'production'] as const;
export type AppEnv = (typeof APP_ENVS)[number];

export type RawEnv = {
  /** Raw `EXPO_PUBLIC_API_URL`. */
  apiUrl: string | undefined;
  /** Raw `EXPO_PUBLIC_APP_ENV`. */
  appEnv: string | undefined;
};

export type AppConfig = {
  /** API base URL without a trailing slash. */
  apiUrl: string;
  appEnv: AppEnv;
};

const HELP = 'See .env.example and docs/environments.md.';
const HTTP_URL = /^https?:\/\/[^\s/?#]+\S*$/i;
const LOOPBACK_URL = /^https?:\/\/(localhost|127(\.\d+){3}|0\.0\.0\.0|\[::1\])([:/?#]|$)/i;

function isAppEnv(value: string): value is AppEnv {
  return (APP_ENVS as readonly string[]).includes(value);
}

/**
 * Validates the raw env values and returns the app config. Pure: no `process.env` access, so it is
 * easy to test. Throws a readable Error naming the variable when something is wrong.
 */
export function parseEnv(raw: RawEnv): AppConfig {
  const appEnvValue = raw.appEnv?.trim();
  let appEnv: AppEnv = 'development';
  if (appEnvValue) {
    if (!isAppEnv(appEnvValue)) {
      throw new Error(
        `EXPO_PUBLIC_APP_ENV is "${appEnvValue}" but must be one of: ${APP_ENVS.join(', ')}. ${HELP}`,
      );
    }
    appEnv = appEnvValue;
  }

  const url = raw.apiUrl?.trim();
  if (!url) {
    throw new Error(
      `EXPO_PUBLIC_API_URL is not set (app env: ${appEnv}). ` +
        (appEnv === 'development'
          ? 'Copy .env.example to .env and restart the dev server with `pnpm nx start mobile`. '
          : 'Set it in the "env" of this build profile in apps/mobile/eas.json. ') +
        HELP,
    );
  }
  if (!HTTP_URL.test(url)) {
    throw new Error(
      `EXPO_PUBLIC_API_URL is "${url}", which is not a valid http(s) URL (example: http://localhost:3000). ${HELP}`,
    );
  }
  if (appEnv !== 'development' && LOOPBACK_URL.test(url)) {
    throw new Error(
      `EXPO_PUBLIC_API_URL is "${url}" in a ${appEnv} build, but localhost is unreachable from a device. ${HELP}`,
    );
  }

  return { apiUrl: url.replace(/\/+$/, ''), appEnv };
}

// Expo inlines EXPO_PUBLIC_* only on static `process.env.NAME` access (no destructuring, no
// `process.env[name]`), so each variable is read by its literal name, here and only here.
export const config: AppConfig = parseEnv({
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  appEnv: process.env.EXPO_PUBLIC_APP_ENV,
});

export const { apiUrl, appEnv } = config;
