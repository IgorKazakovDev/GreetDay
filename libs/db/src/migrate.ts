import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { Db } from './client';

export const migrationsFolder = fileURLToPath(new URL('../migrations', import.meta.url));

/** Applies pending migrations. Used by integration-test setup; dev/CI use `nx run db:db:migrate`. */
export async function runMigrations(db: Db): Promise<void> {
  await migrate(db, { migrationsFolder });
}
