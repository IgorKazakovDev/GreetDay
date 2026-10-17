import fp from 'fastify-plugin';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import type { ErrorResponse } from '@greetday/contracts';

/**
 * Every error leaves the API as `ErrorResponse` (libs/contracts/src/error.ts).
 * 5xx details are logged, never sent to the client.
 */
export const errorHandlerPlugin = fp(
  async (app) => {
    app.setErrorHandler((error, request, reply) => {
      if (hasZodFastifySchemaValidationErrors(error)) {
        const body: ErrorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.validation.map((v) => ({
              path: v.instancePath,
              message: v.message,
            })),
          },
        };
        return reply.status(400).send(body);
      }

      const statusCode =
        typeof error === 'object' && error !== null && 'statusCode' in error
          ? Number(error.statusCode)
          : 500;
      if (statusCode >= 500) {
        request.log.error({ err: error }, 'Unhandled error');
        const body: ErrorResponse = {
          error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
        };
        return reply.status(500).send(body);
      }

      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : 'BAD_REQUEST';
      const message = error instanceof Error ? error.message : 'Request failed';
      const body: ErrorResponse = { error: { code, message } };
      return reply.status(statusCode).send(body);
    });

    app.setNotFoundHandler((request, reply) => {
      const body: ErrorResponse = {
        error: { code: 'NOT_FOUND', message: `Route ${request.method} ${request.url} not found` },
      };
      return reply.status(404).send(body);
    });
  },
  { name: 'error-handler' },
);
