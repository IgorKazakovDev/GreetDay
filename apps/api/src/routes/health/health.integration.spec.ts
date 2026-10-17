import { healthResponseSchema } from '@greetday/contracts';
import type { App } from '../../app';
import { buildApp } from '../../app';
import { buildTestApp } from '../../../test/helpers';

describe('GET /health', () => {
  let app: App;

  beforeAll(async () => {
    app = await buildTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns ok when the database is reachable', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    const body = healthResponseSchema.parse(res.json());
    expect(body.status).toBe('ok');
    expect(body.checks.database).toBe('ok');
  });

  it('returns 503 degraded when the database is unreachable', async () => {
    const broken = await buildApp({
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      DATABASE_URL: 'postgres://nobody:nothing@127.0.0.1:1/none',
    });
    try {
      const res = await broken.inject({ method: 'GET', url: '/health' });
      expect(res.statusCode).toBe(503);
      expect(res.json()).toMatchObject({ status: 'degraded', checks: { database: 'error' } });
    } finally {
      await broken.close();
    }
  });

  it('returns the shared error format for unknown routes', async () => {
    const res = await app.inject({ method: 'GET', url: '/nope' });

    expect(res.statusCode).toBe(404);
    expect(res.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
  });
});
