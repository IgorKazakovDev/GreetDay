import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { z } from 'zod';
import { errorCodes, errorResponseSchema, isKnownErrorCode } from '@greetday/contracts';
import { AppError } from '../errors';
import { errorHandlerPlugin } from './error-handler';

/**
 * A tiny app with the real error handler and one route per way an error can be thrown. No
 * database needed: this proves the handler, not the routes.
 */
async function buildErrorApp() {
  const app = Fastify({ logger: false, bodyLimit: 64 }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  await app.register(errorHandlerPlugin);

  app.post('/validated', { schema: { body: z.object({ name: z.string().min(1) }) } }, () => ({
    ok: true,
  }));
  app.get('/app-error/:status', async (request) => {
    const { status } = request.params as { status: string };
    const codes = {
      401: errorCodes.UNAUTHENTICATED,
      404: errorCodes.NOT_FOUND,
      429: errorCodes.RATE_LIMITED,
    } as const;
    throw new AppError(Number(status), codes[Number(status) as keyof typeof codes]);
  });
  app.get('/forbidden', async () => {
    throw Object.assign(new Error('not yours'), { statusCode: 403 });
  });
  app.get('/unknown-4xx-code', async () => {
    throw Object.assign(new Error('Fastify internals text'), {
      statusCode: 409,
      code: 'SOME_FRAMEWORK_CODE',
    });
  });
  app.get('/unexpected', async () => {
    throw new Error('connection to postgres at 10.0.0.7:5432 failed: password authentication');
  });
  app.get('/driver-error', async () => {
    // pg errors carry a string `code` (SQLSTATE) and no statusCode.
    throw Object.assign(new Error('duplicate key value violates unique constraint "users_pkey"'), {
      code: '23505',
    });
  });
  app.get('/server-status', async () => {
    throw Object.assign(new Error('bad gateway details'), { statusCode: 502, code: 'NOT_FOUND' });
  });
  app.get(
    '/response-mismatch',
    { schema: { response: { 200: z.object({ id: z.uuid() }) } } },
    () => {
      return { id: 'not-a-uuid' } as never;
    },
  );

  return app;
}

type App = Awaited<ReturnType<typeof buildErrorApp>>;

describe('error handler', () => {
  let app: App;

  beforeAll(async () => {
    app = await buildErrorApp();
  });

  afterAll(async () => {
    await app.close();
  });

  /** Every branch must send the shared shape with a catalogue code and no leaked internals. */
  function expectCatalogueError(res: { statusCode: number; body: string; json: () => unknown }) {
    const body = errorResponseSchema.parse(res.json());
    expect(isKnownErrorCode(body.error.code)).toBe(true);
    expect(res.body).not.toMatch(/FST_ERR|stack|node_modules|postgres|pg_|password|users_pkey/i);
    return body;
  }

  it('returns 400 VALIDATION_ERROR with details when the body fails validation', async () => {
    const res = await app.inject({ method: 'POST', url: '/validated', payload: { name: '' } });

    expect(res.statusCode).toBe(400);
    const body = expectCatalogueError(res);
    expect(body.error.code).toBe(errorCodes.VALIDATION_ERROR);
    expect(body.error.details).toEqual([expect.objectContaining({ path: '/name' })]);
  });

  it.each([
    [401, errorCodes.UNAUTHENTICATED],
    [404, errorCodes.NOT_FOUND],
    [429, errorCodes.RATE_LIMITED],
  ])('keeps status %i and its catalogue code when an AppError is thrown', async (status, code) => {
    const res = await app.inject({ method: 'GET', url: `/app-error/${status}` });

    expect(res.statusCode).toBe(status);
    expect(expectCatalogueError(res).error.code).toBe(code);
  });

  it('returns 404 NOT_FOUND for an unknown route', async () => {
    const res = await app.inject({ method: 'GET', url: '/does-not-exist' });

    expect(res.statusCode).toBe(404);
    const body = expectCatalogueError(res);
    expect(body.error.code).toBe(errorCodes.NOT_FOUND);
    expect(body.error.message).not.toContain('does-not-exist');
  });

  it('returns 415 BAD_REQUEST, not the Fastify code, for an unsupported content type', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/validated',
      headers: { 'content-type': 'application/xml' },
      payload: '<a/>',
    });

    expect(res.statusCode).toBe(415);
    expect(expectCatalogueError(res).error.code).toBe(errorCodes.BAD_REQUEST);
  });

  it('returns 413 BAD_REQUEST, not the Fastify code, when the body is too large', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/validated',
      payload: { name: 'x'.repeat(200) },
    });

    expect(res.statusCode).toBe(413);
    expect(expectCatalogueError(res).error.code).toBe(errorCodes.BAD_REQUEST);
  });

  it('returns 400 BAD_REQUEST for malformed JSON', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/validated',
      headers: { 'content-type': 'application/json' },
      payload: '{ not json',
    });

    expect(res.statusCode).toBe(400);
    expect(expectCatalogueError(res).error.code).toBe(errorCodes.BAD_REQUEST);
  });

  it('falls back to the status-based code when a thrown code is not in the catalogue', async () => {
    const res = await app.inject({ method: 'GET', url: '/unknown-4xx-code' });

    expect(res.statusCode).toBe(409);
    const body = expectCatalogueError(res);
    expect(body.error.code).toBe(errorCodes.BAD_REQUEST);
    expect(res.body).not.toContain('SOME_FRAMEWORK_CODE');
    expect(res.body).not.toContain('Fastify internals');
  });

  it('answers a 403 as 404 NOT_FOUND so another user resource cannot be probed', async () => {
    const res = await app.inject({ method: 'GET', url: '/forbidden' });

    expect(res.statusCode).toBe(404);
    const body = expectCatalogueError(res);
    expect(body.error.code).toBe(errorCodes.NOT_FOUND);
    expect(res.body).not.toContain('not yours');
  });

  it.each(['/unexpected', '/driver-error', '/server-status', '/response-mismatch'])(
    'returns a generic 500 INTERNAL_ERROR without internals for %s',
    async (url) => {
      const res = await app.inject({ method: 'GET', url });

      expect(res.statusCode).toBe(500);
      const body = expectCatalogueError(res);
      expect(body.error).toEqual({
        code: errorCodes.INTERNAL_ERROR,
        message: 'Internal server error',
      });
    },
  );
});
