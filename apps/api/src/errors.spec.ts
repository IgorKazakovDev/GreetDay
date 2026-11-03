import { errorCodes, errorResponseSchema, isKnownErrorCode } from '@greetday/contracts';
import { AppError, toErrorResponse } from './errors';

describe('toErrorResponse', () => {
  const fastifyError = (statusCode: number, code: string) =>
    Object.assign(new Error('Fastify says: internal wording'), { statusCode, code });

  it.each<[string, unknown, number, string]>([
    ['a 400 without a code', { statusCode: 400 }, 400, errorCodes.BAD_REQUEST],
    ['a 401', { statusCode: 401 }, 401, errorCodes.UNAUTHENTICATED],
    ['a 404', { statusCode: 404 }, 404, errorCodes.NOT_FOUND],
    ['a 429', { statusCode: 429 }, 429, errorCodes.RATE_LIMITED],
    ['a 403 (never exposed)', { statusCode: 403 }, 404, errorCodes.NOT_FOUND],
    ['a 405', { statusCode: 405 }, 405, errorCodes.BAD_REQUEST],
    ['a 413', fastifyError(413, 'FST_ERR_CTP_BODY_TOO_LARGE'), 413, errorCodes.BAD_REQUEST],
    ['a 415', fastifyError(415, 'FST_ERR_CTP_INVALID_MEDIA_TYPE'), 415, errorCodes.BAD_REQUEST],
    ['a 5xx', { statusCode: 503 }, 500, errorCodes.INTERNAL_ERROR],
    ['a plain Error', new Error('boom'), 500, errorCodes.INTERNAL_ERROR],
    ['a driver error', Object.assign(new Error('pg'), { code: '23505' }), 500, 'INTERNAL_ERROR'],
    ['a NaN status', { statusCode: 'abc' }, 500, errorCodes.INTERNAL_ERROR],
    ['a string', 'oops', 500, errorCodes.INTERNAL_ERROR],
    ['null', null, 500, errorCodes.INTERNAL_ERROR],
    ['undefined', undefined, 500, errorCodes.INTERNAL_ERROR],
    ['an AppError', new AppError(404, errorCodes.NOT_FOUND), 404, errorCodes.NOT_FOUND],
    ['a known code on a plain 4xx', { statusCode: 401, code: 'RATE_LIMITED' }, 401, 'RATE_LIMITED'],
  ])('maps %s to %i %s', (_name, thrown, status, code) => {
    const result = toErrorResponse(thrown);

    expect(result.statusCode).toBe(status);
    expect(result.body.error.code).toBe(code);
    expect(isKnownErrorCode(result.body.error.code)).toBe(true);
    expect(errorResponseSchema.safeParse(result.body).success).toBe(true);
  });

  it('never forwards the thrown message or code', () => {
    const { body } = toErrorResponse(fastifyError(415, 'FST_ERR_CTP_INVALID_MEDIA_TYPE'));

    expect(JSON.stringify(body)).not.toMatch(/Fastify|FST_ERR/);
  });

  it('asks for the 403-as-404 remap and unexpected errors to be logged', () => {
    expect(toErrorResponse({ statusCode: 403 }).log).toBe('warn');
    expect(toErrorResponse(new Error('boom')).log).toBe('error');
    expect(toErrorResponse({ statusCode: 404 }).log).toBeUndefined();
  });
});
