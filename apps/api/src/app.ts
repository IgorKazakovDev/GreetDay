import Fastify, { type FastifyServerOptions } from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import type { Env } from './env';
import { dbPlugin } from './plugins/db';
import { errorHandlerPlugin } from './plugins/error-handler';
import { healthRoutes } from './routes/health/index';

export type AppConfig = Pick<Env, 'NODE_ENV' | 'LOG_LEVEL' | 'DATABASE_URL'>;

function loggerOptions(config: AppConfig): FastifyServerOptions['logger'] {
  const base = {
    level: config.LOG_LEVEL,
    // Never log credentials or tokens.
    redact: ['req.headers.authorization', 'req.headers.cookie'],
  };
  if (config.NODE_ENV === 'development') {
    return {
      ...base,
      transport: { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss' } },
    };
  }
  return base;
}

/**
 * Builds the Fastify app without listening, so tests can use `app.inject()`.
 * Register one plugin per feature under src/routes/<feature>/.
 */
export async function buildApp(config: AppConfig) {
  const app = Fastify({ logger: loggerOptions(config) }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandlerPlugin);
  await app.register(dbPlugin, { connectionString: config.DATABASE_URL });

  await app.register(healthRoutes);

  return app;
}

export type App = Awaited<ReturnType<typeof buildApp>>;
