import { healthResponseSchema } from './health';

describe('healthResponseSchema', () => {
  it('accepts a healthy response', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      checks: { database: 'ok' },
      uptimeSeconds: 12.5,
    });
    expect(result.success).toBe(true);
  });

  it('rejects an unknown status', () => {
    const result = healthResponseSchema.safeParse({
      status: 'fine',
      checks: { database: 'ok' },
      uptimeSeconds: 1,
    });
    expect(result.success).toBe(false);
  });
});
