import { errorCodes } from '@greetday/contracts';
import { ApiError, messageFor, toClientErrorCode, type ClientErrorCode } from './errors';

const GENERIC = 'Something went wrong. Please try again.';

describe('messageFor', () => {
  it.each<[ClientErrorCode, string]>([
    ['UNAUTHENTICATED', 'Your session has expired. Please sign in again.'],
    ['NETWORK_ERROR', GENERIC],
    ['UNKNOWN', GENERIC],
    ['VALIDATION_ERROR', GENERIC],
    ['BAD_REQUEST', GENERIC],
    ['NOT_FOUND', GENERIC],
    ['RATE_LIMITED', GENERIC],
    ['INTERNAL_ERROR', GENERIC],
  ])('returns the copy for %s', (code, expected) => {
    expect(messageFor(new ApiError(500, code, 'ignored'))).toBe(expected);
  });

  it('never returns the server message', () => {
    const error = new ApiError(500, 'INTERNAL_ERROR', 'select * from users failed');

    expect(messageFor(error)).not.toContain('select');
  });

  it('returns the generic message for anything that is not an ApiError', () => {
    expect(messageFor(new TypeError('boom'))).toBe(GENERIC);
    expect(messageFor('boom')).toBe(GENERIC);
    expect(messageFor(undefined)).toBe(GENERIC);
  });

  it('has a message for every documented error code', () => {
    for (const code of Object.values(errorCodes)) {
      expect(messageFor(new ApiError(400, code, 'x'))).toEqual(expect.any(String));
    }
  });
});

describe('toClientErrorCode', () => {
  it('keeps a documented code', () => {
    expect(toClientErrorCode('NOT_FOUND')).toBe('NOT_FOUND');
  });

  it('maps a code this build does not know to UNKNOWN', () => {
    expect(toClientErrorCode('FRIEND_NOT_FOUND')).toBe('UNKNOWN');
  });
});
