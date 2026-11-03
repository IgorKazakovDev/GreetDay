import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { errorCodes, isKnownErrorCode, type ErrorCode } from '@greetday/contracts';

/**
 * Throw this from a route to answer with a specific catalogue code:
 *
 *   throw new AppError(404, errorCodes.NOT_FOUND);
 *
 * `code` is typed as `ErrorCode`, so a code that isn't in `@greetday/contracts` fails typecheck.
 * `message` is for the server log only; the client always gets the fixed text for the code.
 */
export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: ErrorCode,
    message: string = code,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** `ErrorResponse` with `code` narrowed to the catalogue (still assignable to `ErrorResponse`). */
export type ApiErrorBody = {
  error: { code: ErrorCode; message: string; details?: unknown };
};

export type MappedError = {
  statusCode: number;
  body: ApiErrorBody;
  /** Something the server operator should see in the log (the client never gets the details). */
  log?: 'warn' | 'error';
};

/**
 * One fixed, safe sentence per code. The app shows its own copy per code and never this text; it
 * exists so the API never forwards framework, driver or user-supplied text. `Record<ErrorCode, …>`
 * makes adding a code to the catalogue fail typecheck until it has a message here.
 */
const messages: Record<ErrorCode, string> = {
  [errorCodes.VALIDATION_ERROR]: 'Request validation failed',
  [errorCodes.BAD_REQUEST]: 'Bad request',
  [errorCodes.UNAUTHENTICATED]: 'Authentication required',
  [errorCodes.NOT_FOUND]: 'Not found',
  [errorCodes.RATE_LIMITED]: 'Too many requests',
  [errorCodes.INTERNAL_ERROR]: 'Internal server error',
};

/**
 * Default code for a 4xx status when the error doesn't carry a catalogue code of its own.
 * Any 4xx not listed (405, 408, 409, 413, 414, 415, 422, 431, ...) is "the request is wrong in a
 * way the app has no special behaviour for", which is BAD_REQUEST. The HTTP status itself is kept,
 * so 413 stays 413. 403 is handled separately (see `toErrorResponse`).
 */
const codeByStatus: Record<number, ErrorCode> = {
  400: errorCodes.BAD_REQUEST,
  401: errorCodes.UNAUTHENTICATED,
  404: errorCodes.NOT_FOUND,
  429: errorCodes.RATE_LIMITED,
};

function readProp(error: unknown, key: 'statusCode' | 'code'): unknown {
  return typeof error === 'object' && error !== null && key in error
    ? (error as Record<string, unknown>)[key]
    : undefined;
}

function build(code: ErrorCode, details?: unknown): MappedError['body'] {
  return {
    error: { code, message: messages[code], ...(details === undefined ? {} : { details }) },
  };
}

/** The not-found handler (unknown route) uses this so it shares the same code and message. */
export function notFoundResponse(): MappedError {
  return { statusCode: 404, body: build(errorCodes.NOT_FOUND) };
}

/**
 * The single place where anything thrown becomes an API error. Pure (no Fastify reply, no
 * logging), so every branch is unit-testable. Every returned `code` is in the catalogue.
 *
 * Branches, in order:
 * 1. Zod request validation  -> 400 VALIDATION_ERROR (+ `details`)
 * 2. status missing / >= 500  -> 500 INTERNAL_ERROR (details only go to the log)
 * 3. status 403               -> 404 NOT_FOUND (we never answer 403; see below)
 * 4. a thrown catalogue code  -> that code, original status (e.g. `AppError`)
 * 5. any other 4xx            -> code by status (`codeByStatus`), original status
 */
export function toErrorResponse(error: unknown): MappedError {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return {
      statusCode: 400,
      body: build(
        errorCodes.VALIDATION_ERROR,
        error.validation.map((v) => ({ path: v.instancePath, message: v.message })),
      ),
    };
  }

  const rawStatus = Number(readProp(error, 'statusCode'));
  const hasClientStatus = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus < 500;
  if (!hasClientStatus) {
    // No status (a plain `throw new Error`, a driver error) or a 5xx: treat as unexpected.
    return {
      statusCode: 500,
      body: build(errorCodes.INTERNAL_ERROR),
      log: 'error',
    };
  }

  // Security rule: another user's resource is 404, never 403, so ids can't be probed. We never
  // produce a 403 ourselves; if one reaches here (a plugin, a mistake) answer as "not found" and
  // log it so the mistake gets noticed instead of leaking "this exists but isn't yours".
  if (rawStatus === 403) {
    return { statusCode: 404, body: build(errorCodes.NOT_FOUND), log: 'warn' };
  }

  // Only pass a thrown `code` through when it's in the catalogue. Fastify's own errors carry
  // codes like FST_ERR_CTP_INVALID_MEDIA_TYPE, which must not reach clients.
  const thrownCode = readProp(error, 'code');
  const code =
    typeof thrownCode === 'string' && isKnownErrorCode(thrownCode)
      ? thrownCode
      : (codeByStatus[rawStatus] ?? errorCodes.BAD_REQUEST);
  return { statusCode: rawStatus, body: build(code) };
}
