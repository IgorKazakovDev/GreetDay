import fp from 'fastify-plugin';
import { notFoundResponse, toErrorResponse } from '../errors';

/**
 * Every error leaves the API as `ErrorResponse` (libs/contracts/src/error.ts) with a code from the
 * catalogue (libs/contracts/src/error-codes.ts). The mapping lives in `toErrorResponse`
 * (src/errors.ts); this plugin only plugs it into Fastify and does the logging.
 * 5xx details are logged, never sent to the client.
 */
export const errorHandlerPlugin = fp(
  async (app) => {
    app.setErrorHandler((error, request, reply) => {
      const { statusCode, body, log } = toErrorResponse(error);
      if (log === 'error') {
        request.log.error({ err: error }, 'Unhandled error');
      } else if (log === 'warn') {
        request.log.warn({ err: error }, '403 produced; answered as 404 (never 403)');
      }
      return reply.status(statusCode).send(body);
    });

    app.setNotFoundHandler((_request, reply) => {
      const { statusCode, body } = notFoundResponse();
      return reply.status(statusCode).send(body);
    });
  },
  { name: 'error-handler' },
);
