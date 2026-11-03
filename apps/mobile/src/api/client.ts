import { z } from 'zod';
import { errorResponseSchema, healthResponseSchema } from '@greetday/contracts';
import { apiUrl } from '@/config/env';
import { ApiError, toClientErrorCode } from './errors';

export { ApiError, messageFor, type ClientErrorCode } from './errors';

/** A request that hasn't finished after this long fails with `NETWORK_ERROR` (reason `timeout`). */
export const DEFAULT_TIMEOUT_MS = 15_000;

type HeaderMap = Record<string, string>;
type AuthHeaderProvider = () => HeaderMap | undefined | Promise<HeaderMap | undefined>;

let authHeaderProvider: AuthHeaderProvider | undefined;

/**
 * Seam for authentication (filled in E2-S3-T2): register a function that returns the headers to
 * add to every request (e.g. `{ Authorization: 'Bearer …' }`), or `undefined` when signed out.
 * Like an axios request interceptor on the web. Pass `undefined` to unregister.
 */
export function setAuthHeaderProvider(provider: AuthHeaderProvider | undefined): void {
  authHeaderProvider = provider;
}

export type RequestOptions = {
  /** Overrides `DEFAULT_TIMEOUT_MS` for this request. */
  timeoutMs?: number;
};

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** Sends the request and returns the parsed, schema-validated body. Throws only `ApiError`. */
async function request<S extends z.ZodType>(
  method: Method,
  path: string,
  schema: S,
  body: unknown,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions = {},
): Promise<z.infer<S>> {
  const controller = new AbortController();
  let timedOut = false;
  // The timer covers connecting and reading the body, like a fetch + AbortSignal.timeout on the web.
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    let status: number;
    let ok: boolean;
    let text: string;
    try {
      const headers: HeaderMap = { Accept: 'application/json', ...(await authHeaderProvider?.()) };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      const res = await fetch(`${apiUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      status = res.status;
      ok = res.ok;
      text = await res.text();
    } catch (cause) {
      // fetch rejects (instead of resolving with a bad status) when no response arrived at all.
      throw timedOut
        ? new ApiError(0, 'NETWORK_ERROR', 'Request timed out', 'timeout')
        : new ApiError(0, 'NETWORK_ERROR', `Network request failed: ${String(cause)}`, 'network');
    }

    let json: unknown;
    try {
      json = text === '' ? undefined : JSON.parse(text);
    } catch {
      json = undefined; // not JSON (e.g. an HTML error page from a proxy)
    }

    if (!ok) {
      const parsed = errorResponseSchema.safeParse(json);
      if (parsed.success) {
        throw new ApiError(
          status,
          toClientErrorCode(parsed.data.error.code),
          parsed.data.error.message,
        );
      }
      // A 401 is unambiguous even without a body, so the auth flow can still hook in.
      throw new ApiError(
        status,
        status === 401 ? 'UNAUTHENTICATED' : 'UNKNOWN',
        `Request failed with ${status}`,
      );
    }

    const result = schema.safeParse(json);
    if (!result.success) {
      throw new ApiError(
        status,
        'UNKNOWN',
        `Response did not match the schema: ${result.error.message}`,
      );
    }
    return result.data;
  } finally {
    clearTimeout(timer);
  }
}

/** Schema for responses without a body (204 No Content): `apiDelete(path, noContentSchema)`. */
export const noContentSchema = z.undefined();

export const apiGet = <S extends z.ZodType>(path: string, schema: S, options?: RequestOptions) =>
  request('GET', path, schema, undefined, options);

export const apiPost = <S extends z.ZodType>(
  path: string,
  schema: S,
  body?: unknown,
  options?: RequestOptions,
) => request('POST', path, schema, body, options);

export const apiPatch = <S extends z.ZodType>(
  path: string,
  schema: S,
  body?: unknown,
  options?: RequestOptions,
) => request('PATCH', path, schema, body, options);

export const apiPut = <S extends z.ZodType>(
  path: string,
  schema: S,
  body?: unknown,
  options?: RequestOptions,
) => request('PUT', path, schema, body, options);

export const apiDelete = <S extends z.ZodType>(path: string, schema: S, options?: RequestOptions) =>
  request('DELETE', path, schema, undefined, options);

export const api = {
  health: () => apiGet('/health', healthResponseSchema),
};
