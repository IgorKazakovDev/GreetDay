import { createDb, runMigrations } from '@greetday/db';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'postgres']);

/** Migrates the test database once before the integration tests run. */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Copy .env.example to .env and run `docker compose up -d`.',
    );
  }
  if (!LOCAL_HOSTS.has(new URL(url).hostname)) {
    throw new Error('TEST_DATABASE_URL must point at a local database.');
  }
  const { db, close } = createDb(url);
  try {
    await runMigrations(db);
  } finally {
    await close();
  }
}
