import { isKnownErrorCode, type ErrorCode } from '@greetday/contracts';

/**
 * Every `code` an `ApiError` can carry:
 * - the codes the API documents (`ErrorCode` from @greetday/contracts),
 * - `NETWORK_ERROR`: the request never got an answer (offline, DNS, connection reset, timeout).
 *   Client-only on purpose: the API never sends it, so it is not in the contracts.
 * - `UNKNOWN`: an answer we can't interpret (a code this app build doesn't know yet, a non-JSON
 *   body such as a proxy's HTML 502, or a 2xx body that fails the schema).
 */
export type ClientErrorCode = ErrorCode | 'NETWORK_ERROR' | 'UNKNOWN';

/**
 * Like `fetch` rejecting on the web, but typed. Screens branch on `code` and show `messageFor(error)`.
 *
 * `message` is for developers and logs only (it may hold the server's text). Never render it:
 * use `messageFor(error)`.
 */
export class ApiError extends Error {
  constructor(
    /** HTTP status, or 0 when no response arrived (`NETWORK_ERROR`). */
    readonly status: number,
    readonly code: ClientErrorCode,
    message: string,
    /** Only for `NETWORK_ERROR`: whether the request timed out or failed to connect. */
    readonly reason?: 'timeout' | 'network',
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Copy comes from docs/product/design-brief.md: §2.2 "Offline pattern" says any failed server
// action, offline or not, uses one error-with-retry path, and the backlog (E0-S2) names the
// generic text below as the fallback. The brief has no per-code copy, so only UNAUTHENTICATED has
// its own line (proposed, not from a mock: product-designer to confirm).
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const messages: Partial<Record<ClientErrorCode, string>> = {
  UNAUTHENTICATED: 'Your session has expired. Please sign in again.',
};

/**
 * The text a screen may show for a failed request. Accepts anything that was thrown, so a
 * `catch (e)` can pass `e` straight in. Never returns the server's `message`.
 */
export function messageFor(error: unknown): string {
  if (error instanceof ApiError) {
    return messages[error.code] ?? GENERIC_MESSAGE;
  }
  return GENERIC_MESSAGE;
}

/** Maps the `code` of a parsed error body to what this build can type, `UNKNOWN` otherwise. */
export function toClientErrorCode(code: string): ClientErrorCode {
  return isKnownErrorCode(code) ? code : 'UNKNOWN';
}
