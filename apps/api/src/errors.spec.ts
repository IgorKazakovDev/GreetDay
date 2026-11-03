import { errorCodes, errorResponseSchema, isKnownErrorCode } from '@greetday/contracts';
import { AppError, statusFor, toErrorResponse } from './errors';

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
    ['an AppError', new AppError(errorCodes.NOT_FOUND), 404, errorCodes.NOT_FOUND],
    ['an AppError RATE_LIMITED', new AppError(errorCodes.RATE_LIMITED), 429, 'RATE_LIMITED'],
    ['an AppError INTERNAL_ERROR', new AppError(errorCodes.INTERNAL_ERROR), 500, 'INTERNAL_ERROR'],
    // Only an AppError may choose a code; a lookalike's code is ignored and the status decides.
    [
      'a lookalike with a catalogue code',
      { statusCode: 401, code: 'RATE_LIMITED' },
      401,
      'UNAUTHENTICATED',
    ],
    [
      'a lookalike with a mismatched code',
      { statusCode: 400, code: 'NOT_FOUND' },
      400,
      'BAD_REQUEST',
    ],
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

  it('gives every AppError the status from statusFor', () => {
    for (const code of Object.values(errorCodes)) {
      expect(new AppError(code).statusCode).toBe(statusFor[code]);
      expect(toErrorResponse(new AppError(code)).statusCode).toBe(statusFor[code]);
    }
  });

  it('keeps the AppError log message out of the response and asks for it to be logged', () => {
    const result = toErrorResponse(new AppError(errorCodes.NOT_FOUND, 'contact 7 not found'));

    expect(JSON.stringify(result.body)).not.toContain('contact 7');
    expect(result.log).toBe('info');
    expect(toErrorResponse(new AppError(errorCodes.INTERNAL_ERROR)).log).toBe('error');
  });

  it('asks for the 403-as-404 remap and unexpected errors to be logged', () => {
    expect(toErrorResponse({ statusCode: 403 }).log).toBe('warn');
    expect(toErrorResponse(new Error('boom')).log).toBe('error');
    expect(toErrorResponse({ statusCode: 404 }).log).toBeUndefined();
  });
});
