import { loadEnv } from './env';

describe('loadEnv', () => {
  it('applies defaults', () => {
    const env = loadEnv({ DATABASE_URL: 'postgres://u:p@localhost:5432/db' });
    expect(env).toMatchObject({ PORT: 3000, LOG_LEVEL: 'info', NODE_ENV: 'development' });
  });

  it('fails fast when DATABASE_URL is missing', () => {
    expect(() => loadEnv({})).toThrow(/DATABASE_URL/);
  });
});
