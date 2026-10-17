import fp from 'fastify-plugin';
import { createDb, type DbHandle } from '@greetday/db';

declare module 'fastify' {
  interface FastifyInstance {
    db: DbHandle;
  }
}

export interface DbPluginOptions {
  connectionString: string;
}

/** Opens one pg pool per app instance and closes it when the app shuts down. */
export const dbPlugin = fp<DbPluginOptions>(
  async (app, { connectionString }) => {
    const handle = createDb(connectionString);
    app.decorate('db', handle);
    app.addHook('onClose', async () => {
      await handle.close();
    });
  },
  { name: 'db' },
);
