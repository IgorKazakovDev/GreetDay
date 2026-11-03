import { isKnownErrorCode, type ErrorCode } from '@greetday/contracts';

/**
 * Every `code` an `ApiError` can carry:
 * - the codes the API documents (`ErrorCode` from @greetday/contracts),
 * - `NETWORK_ERROR`: the request never got an answer (offline, DNS, connection reset, timeout).
 *   Client-only on purpose: the API never sends it, so it is not in the contracts.
 * - `UNKNOWN`: something we can't interpret and can't classify by status either (a 2xx body that
 *   fails the schema, an unexpected 4xx such as 418, a failure inside the client such as an auth
 *   header provider bug or an unserialisable request body).
 *
 * An error response whose code this build doesn't know (or that has no usable body) is classified
 * by HTTP status instead, see `codeForStatus`, so e.g. a future `TOKEN_EXPIRED` 401 still arrives
 * as `UNAUTHENTICATED` on apps that are already shipped.
 */
export type ClientErrorCode = ErrorCode | 'NETWORK_ERROR' | 'UNKNOWN';

export type ApiErrorInit = {
  /** Developer-facing detail appended to `message` (e.g. why the request failed). */
  detail?: string;
  /** Only for `NETWORK_ERROR`: whether the request timed out or failed to connect. */
  reason?: 'timeout' | 'network';
  /** The text the server sent in its `ErrorResponse`. For logs; never render it. */
  serverMessage?: string;
};

/**
 * Like `fetch` rejecting on the web, but typed. Screens branch on `code` and show `messageFor(error)`.
 *
 * `message` is developer-safe (`"API error 404 NOT_FOUND"` plus optional detail), so a stray
 * `Alert.alert(e.message)` can't leak server text. The server's own text is in `serverMessage`;
 * it is for logs only. Screens use `messageFor(error)`.
 */
export class ApiError extends Error {
  /** The text the server sent in its `ErrorResponse`, if any. For logs; never render it. */
  readonly serverMessage?: string;
  /** Only for `NETWORK_ERROR`: whether the request timed out or failed to connect. */
  readonly reason?: 'timeout' | 'network';

  constructor(
    /** HTTP status, or 0 when no response arrived (`NETWORK_ERROR`, client-side failures). */
    readonly status: number,
    readonly code: ClientErrorCode,
    { detail, reason, serverMessage }: ApiErrorInit = {},
  ) {
    super(`API error ${status} ${code}${detail ? `: ${detail}` : ''}`);
    this.name = 'ApiError';
    this.reason = reason;
    this.serverMessage = serverMessage;
  }
}

// Copy comes from docs/product/design-brief.md: §2.2 "Offline pattern" says any failed server
// action, offline or not, uses one error-with-retry path, and the backlog (E0-S2) names the
// generic text below as the fallback. The brief has no per-code copy, so every code uses it.
// This map is the extension point for per-code copy. Session-expired copy for UNAUTHENTICATED is
// pending product-designer approval (E10-S11-T3); until then it falls back to the generic text
// (screens can still branch on `error.code`).
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

const messages: Partial<Record<ClientErrorCode, string>> = {};

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

/**
 * Classifies an error response by HTTP status alone. Used when the body carries a code this build
 * doesn't know, or no usable body at all, so both cases agree.
 */
export function codeForStatus(status: number): ClientErrorCode {
  if (status === 401) return 'UNAUTHENTICATED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500) return 'INTERNAL_ERROR';
  return 'UNKNOWN';
}

/** Keeps a documented code; otherwise falls back to what the HTTP status says. */
export function toClientErrorCode(code: string, status: number): ClientErrorCode {
  return isKnownErrorCode(code) ? code : codeForStatus(status);
}
