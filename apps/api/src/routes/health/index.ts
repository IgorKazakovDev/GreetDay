import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { healthResponseSchema, type HealthResponse } from '@greetday/contracts';

/** GET /health: liveness + database check. Public (no auth). */
export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    { schema: { response: { 200: healthResponseSchema, 503: healthResponseSchema } } },
    async (request, reply) => {
      let database: HealthResponse['checks']['database'] = 'ok';
      try {
        await app.db.ping();
      } catch (err) {
        request.log.warn({ err }, 'Health check: database unreachable');
        database = 'error';
      }
      const body: HealthResponse = {
        status: database === 'ok' ? 'ok' : 'degraded',
        checks: { database },
        uptimeSeconds: process.uptime(),
      };
      return reply.status(database === 'ok' ? 200 : 503).send(body);
    },
  );
};
