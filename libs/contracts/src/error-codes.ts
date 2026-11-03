/**
 * Catalogue of application error codes the API can send in `error.code`.
 *
 * - The HTTP status is the category (400, 401, 404...); the code says what happened.
 * - Codes are a stable public contract: published mobile apps can't be updated instantly, so a
 *   code is never renamed or reused for a different meaning. Add new ones; deprecate, don't edit.
 * - `errorResponseSchema.error.code` stays a plain string on purpose, so an older app still
 *   parses a response carrying a code added after it shipped. Use `isKnownErrorCode` to narrow,
 *   and fall back to a generic message for unknown codes.
 * - Client-only conditions (no network, timeout) are NOT here: the API never sends them.
 *   The mobile app defines its own `NETWORK_ERROR` next to its fetch wrapper.
 * - Feature codes (e.g. `FRIEND_NOT_FOUND`) are added with the feature that first uses them.
 */
export const errorCodes = {
  /** 400: params, query or body failed validation. `details` lists the problems. */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** 400: the request is malformed in a way no more specific code covers. */
  BAD_REQUEST: 'BAD_REQUEST',
  /** 401: missing, invalid or expired credentials. */
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  /** 404: unknown route, or a resource that doesn't exist (or belongs to another user, never 403). */
  NOT_FOUND: 'NOT_FOUND',
  /** 429: too many requests. */
  RATE_LIMITED: 'RATE_LIMITED',
  /** 5xx: unexpected server failure. The message is generic; details are only in the server log. */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof errorCodes)[keyof typeof errorCodes];

const knownCodes: ReadonlySet<string> = new Set(Object.values(errorCodes));

/** Narrows an arbitrary `error.code` string to a code this build of the app knows about. */
export function isKnownErrorCode(code: string): code is ErrorCode {
  return knownCodes.has(code);
}
