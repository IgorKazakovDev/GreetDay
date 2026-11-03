import { errorCodes, isKnownErrorCode } from './error-codes';
import { errorResponseSchema } from './error';

describe('errorCodes', () => {
  it('uses each key as its own value (the wire value never drifts from the name)', () => {
    for (const [key, value] of Object.entries(errorCodes)) {
      expect(value).toBe(key);
    }
  });

  it('contains the documented codes', () => {
    expect(Object.values(errorCodes).sort()).toEqual(
      [
        'BAD_REQUEST',
        'INTERNAL_ERROR',
        'NOT_FOUND',
        'RATE_LIMITED',
        'UNAUTHENTICATED',
        'VALIDATION_ERROR',
      ].sort(),
    );
  });

  it('does not include client-only codes', () => {
    expect(isKnownErrorCode('NETWORK_ERROR')).toBe(false);
  });
});

describe('isKnownErrorCode', () => {
  it('accepts every catalogue code', () => {
    for (const code of Object.values(errorCodes)) {
      expect(isKnownErrorCode(code)).toBe(true);
    }
  });

  it('rejects unknown, empty and differently-cased strings', () => {
    expect(isKnownErrorCode('SOMETHING_NEW')).toBe(false);
    expect(isKnownErrorCode('')).toBe(false);
    expect(isKnownErrorCode('not_found')).toBe(false);
    expect(isKnownErrorCode('toString')).toBe(false);
  });
});

describe('errorResponseSchema with the catalogue', () => {
  it('still parses a code from a newer API that this build does not know', () => {
    const body = { error: { code: 'FUTURE_CODE', message: 'x' } };
    const parsed = errorResponseSchema.parse(body);
    expect(isKnownErrorCode(parsed.error.code)).toBe(false);
  });
});
