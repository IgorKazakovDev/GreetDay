import { errorCodes, errorResponseSchema } from '@greetday/contracts';
import { buildTestApp } from '../test/helpers';
import type { App } from './app';

describe('framework errors through buildApp', () => {
  let app: App;

  beforeAll(async () => {
    app = await buildTestApp();
    // A route with a param, so the router has something to reject before any handler runs.
    app.get('/things/:id', async () => ({ ok: true }));
  });

  afterAll(async () => {
    await app.close();
  });

  function expectCatalogueBadRequest(res: { body: string; json: () => unknown }, path: string) {
    const body = errorResponseSchema.parse(res.json());
    expect(body.error.code).toBe(errorCodes.BAD_REQUEST);
    expect(res.body).not.toMatch(/FST_ERR|not a valid url|max param length/i);
    expect(res.body).not.toContain(path);
  }

  it('returns 400 BAD_REQUEST, not the Fastify body, for a malformed percent-encoded param', async () => {
    const res = await app.inject({ method: 'GET', url: '/things/%E0%A4%A' });

    expect(res.statusCode).toBe(400);
    expectCatalogueBadRequest(res, 'things');
  });

  it('returns 414 BAD_REQUEST, not the Fastify body, for a param over maxParamLength', async () => {
    const res = await app.inject({ method: 'GET', url: `/things/${'a'.repeat(200)}` });

    expect(res.statusCode).toBe(414);
    expectCatalogueBadRequest(res, 'aaaa');
  });
});
