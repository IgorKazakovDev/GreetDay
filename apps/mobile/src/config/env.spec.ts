import { parseEnv } from './env';

describe('parseEnv', () => {
  it.each([
    [
      'local development',
      'http://localhost:3000',
      undefined,
      'http://localhost:3000',
      'development',
    ],
    [
      'LAN IP in development',
      'http://192.168.1.20:3000',
      'development',
      'http://192.168.1.20:3000',
      'development',
    ],
    [
      'loopback in development',
      'http://127.0.0.1:3000',
      'development',
      'http://127.0.0.1:3000',
      'development',
    ],
    [
      'IPv6 loopback in development',
      'http://[::1]:3000',
      'development',
      'http://[::1]:3000',
      'development',
    ],
    [
      'preview',
      'https://api.greetday.invalid',
      'preview',
      'https://api.greetday.invalid',
      'preview',
    ],
    [
      'production',
      'https://api.greetday.invalid',
      'production',
      'https://api.greetday.invalid',
      'production',
    ],
    [
      'trailing slash and spaces',
      '  https://api.greetday.invalid/v1/  ',
      ' production ',
      'https://api.greetday.invalid/v1',
      'production',
    ],
    [
      'https with a port and path',
      'https://api.greetday.invalid:8443/v1',
      'production',
      'https://api.greetday.invalid:8443/v1',
      'production',
    ],
    ['empty app env', 'http://localhost:3000', '', 'http://localhost:3000', 'development'],
  ])('accepts %s', (_name, apiUrl, appEnv, expectedUrl, expectedEnv) => {
    expect(parseEnv({ apiUrl, appEnv })).toEqual({ apiUrl: expectedUrl, appEnv: expectedEnv });
  });

  it.each([undefined, '', '   '])('rejects a missing API URL (%j) in development', (apiUrl) => {
    expect(() => parseEnv({ apiUrl, appEnv: 'development' })).toThrow(
      /EXPO_PUBLIC_API_URL is not set.*\.env\.example.*docs\/environments\.md/,
    );
  });

  it('points at eas.json when the URL is missing in a production build', () => {
    expect(() => parseEnv({ apiUrl: undefined, appEnv: 'production' })).toThrow(/eas\.json/);
  });

  it.each([
    'not a url',
    'ftp://example.com',
    'localhost:3000',
    'http://',
    '//example.com',
    'http://:3000',
    'https://x?a=1',
    'https://x#frag',
    'https://user:pass@host',
    'https://user@host',
  ])('rejects the invalid API URL %j', (apiUrl) => {
    expect(() => parseEnv({ apiUrl, appEnv: 'development' })).toThrow(
      /EXPO_PUBLIC_API_URL is ".*", which is not a valid http\(s\) URL/,
    );
  });

  it.each([
    ['preview', 'http://localhost:3000'],
    ['production', 'http://127.0.0.1:3000'],
    ['production', 'http://0.0.0.0:3000'],
    ['preview', 'http://[::1]:3000'],
  ])('never falls back to localhost in a %s build (%s)', (appEnv, apiUrl) => {
    expect(() => parseEnv({ apiUrl, appEnv })).toThrow(/localhost is unreachable/);
  });

  it.each([
    ['preview', 'http://api.example.com'],
    ['production', 'http://api.example.com'],
    ['production', 'HTTP://api.example.com:8080/v1'],
  ])('requires https in a %s build (%s)', (appEnv, apiUrl) => {
    expect(() => parseEnv({ apiUrl, appEnv })).toThrow(
      /EXPO_PUBLIC_API_URL must use https in a (preview|production) build/,
    );
  });

  it('rejects an unknown app env and names the allowed values', () => {
    expect(() => parseEnv({ apiUrl: 'http://localhost:3000', appEnv: 'prod' })).toThrow(
      /EXPO_PUBLIC_APP_ENV is "prod" but must be one of: development, preview, production/,
    );
  });
});
