import { buildApp } from '../src/app';

/** Builds an app wired to the test database. Close it in afterAll. */
export function buildTestApp() {
  return buildApp({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    DATABASE_URL: process.env.TEST_DATABASE_URL as string,
  });
}
