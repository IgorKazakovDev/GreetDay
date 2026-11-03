import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { notFoundResponse, toErrorResponse } from '../errors';

/**
 * Maps the error, logs it when the operator should see it, and sends the `ErrorResponse`.
 * Shared by `setErrorHandler` (below) and by `frameworkErrorHandler`, so both paths behave the same.
 */
function sendError(error: unknown, request: FastifyRequest, reply: FastifyReply) {
  const { statusCode, body, log } = toErrorResponse(error);
  if (log === 'error') {
    request.log.error({ err: error }, 'Unhandled error');
  } else if (log === 'warn') {
    request.log.warn({ err: error }, '403 produced; answered as 404 (never 403)');
  } else if (log === 'info') {
    // An AppError we threw on purpose: its message is the developer's log text (ids only).
    request.log.info(
      { code: body.error.code },
      error instanceof Error ? error.message : 'AppError',
    );
  }
  return reply.status(statusCode).send(body);
}

/**
 * Fastify's `frameworkErrors` server option. Errors raised before a route is chosen (a malformed
 * percent-encoded URL, a route param over `maxParamLength`, an async constraint failure) never
 * reach `setErrorHandler`; without this option Fastify writes its own body, with `FST_ERR_*` codes
 * and the request path. Pass it to `Fastify({ frameworkErrors })`: it can't be set from a plugin.
 */
export function frameworkErrorHandler(error: Error, request: FastifyRequest, reply: FastifyReply) {
  return sendError(error, request, reply);
}

/**
 * Every error leaves the API as `ErrorResponse` (libs/contracts/src/error.ts) with a code from the
 * catalogue (libs/contracts/src/error-codes.ts). The mapping lives in `toErrorResponse`
 * (src/errors.ts); this plugin only plugs it into Fastify and does the logging.
 * 5xx details are logged, never sent to the client.
 */
export const errorHandlerPlugin = fp(
  async (app) => {
    app.setErrorHandler((error, request, reply) => sendError(error, request, reply));

    app.setNotFoundHandler((_request, reply) => {
      const { statusCode, body } = notFoundResponse();
      return reply.status(statusCode).send(body);
    });
  },
  { name: 'error-handler' },
);
