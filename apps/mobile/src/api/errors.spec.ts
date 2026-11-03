import { errorCodes } from '@greetday/contracts';
import {
  ApiError,
  codeForStatus,
  messageFor,
  toClientErrorCode,
  type ClientErrorCode,
} from './errors';

const GENERIC = 'Something went wrong. Please try again.';

describe('messageFor', () => {
  it.each<[ClientErrorCode, string]>([
    ['UNAUTHENTICATED', GENERIC],
    ['NETWORK_ERROR', GENERIC],
    ['UNKNOWN', GENERIC],
    ['VALIDATION_ERROR', GENERIC],
    ['BAD_REQUEST', GENERIC],
    ['NOT_FOUND', GENERIC],
    ['RATE_LIMITED', GENERIC],
    ['INTERNAL_ERROR', GENERIC],
  ])('returns the copy for %s', (code, expected) => {
    expect(messageFor(new ApiError(500, code))).toBe(expected);
  });

  it('never returns the server message', () => {
    const error = new ApiError(500, 'INTERNAL_ERROR', {
      detail: 'select * from users failed',
      serverMessage: 'select * from users failed',
    });

    expect(messageFor(error)).not.toContain('select');
  });

  it('returns the generic message for anything that is not an ApiError', () => {
    expect(messageFor(new TypeError('boom'))).toBe(GENERIC);
    expect(messageFor('boom')).toBe(GENERIC);
    expect(messageFor(undefined)).toBe(GENERIC);
  });

  it('has a message for every documented error code', () => {
    for (const code of Object.values(errorCodes)) {
      expect(messageFor(new ApiError(400, code))).toEqual(expect.any(String));
    }
  });
});

describe('ApiError', () => {
  it('builds a developer-safe message and keeps the server text separate', () => {
    const error = new ApiError(404, 'NOT_FOUND', { serverMessage: 'No contact 42 for user 7' });

    expect(error.message).toBe('API error 404 NOT_FOUND');
    expect(error.serverMessage).toBe('No contact 42 for user 7');
  });

  it('appends the detail to the message', () => {
    const error = new ApiError(0, 'UNKNOWN', { detail: 'provider failed' });

    expect(error.message).toBe('API error 0 UNKNOWN: provider failed');
  });
});

describe('codeForStatus', () => {
  it.each<[number, ClientErrorCode]>([
    [401, 'UNAUTHENTICATED'],
    [404, 'NOT_FOUND'],
    [429, 'RATE_LIMITED'],
    [500, 'INTERNAL_ERROR'],
    [502, 'INTERNAL_ERROR'],
    [599, 'INTERNAL_ERROR'],
    [400, 'UNKNOWN'],
    [403, 'UNKNOWN'],
    [409, 'UNKNOWN'],
    [418, 'UNKNOWN'],
  ])('maps status %i to %s', (status, expected) => {
    expect(codeForStatus(status)).toBe(expected);
  });
});

describe('toClientErrorCode', () => {
  it('keeps a documented code whatever the status', () => {
    expect(toClientErrorCode('NOT_FOUND', 400)).toBe('NOT_FOUND');
  });

  it('falls back to the status for a code this build does not know', () => {
    expect(toClientErrorCode('TOKEN_EXPIRED', 401)).toBe('UNAUTHENTICATED');
    expect(toClientErrorCode('FRIEND_NOT_FOUND', 418)).toBe('UNKNOWN');
  });
});
