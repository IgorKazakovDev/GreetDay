import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema/index';

export type Schema = typeof schema;
export type Db = NodePgDatabase<Schema>;

export interface DbHandle {
  db: Db;
  pool: Pool;
  /** Runs `select 1`; throws if the database is unreachable. */
  ping: () => Promise<void>;
  close: () => Promise<void>;
}

export function createDb(
  connectionString: string,
  options: Omit<PoolConfig, 'connectionString'> = {},
): DbHandle {
  const pool = new Pool({ connectionString, max: 10, ...options });
  const db = drizzle(pool, { schema, casing: 'snake_case' });
  return {
    db,
    pool,
    ping: async () => {
      await pool.query('select 1');
    },
    close: () => pool.end(),
  };
}
