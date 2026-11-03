import { z } from 'zod';
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  noContentSchema,
  setAuthHeaderProvider,
} from './client';

const schema = z.object({ id: z.string() });

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

let fetchMock: jest.SpiedFunction<typeof fetch>;

beforeEach(() => {
  fetchMock = jest.spyOn(globalThis, 'fetch');
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  setAuthHeaderProvider(undefined);
});

async function caught(promise: Promise<unknown>): Promise<ApiError> {
  const error: unknown = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

describe('api client', () => {
  describe('success', () => {
    it('returns the validated body of a GET', async () => {
      fetchMock.mockResolvedValue(json({ id: 'a1' }));

      await expect(apiGet('/things/a1', schema)).resolves.toEqual({ id: 'a1' });

      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('http://localhost:3000/things/a1');
      expect(init?.method).toBe('GET');
      expect(init?.body).toBeUndefined();
    });

    it.each([
      ['POST', apiPost],
      ['PATCH', apiPatch],
      ['PUT', apiPut],
    ] as const)('sends the JSON body and method of a %s', async (method, call) => {
      fetchMock.mockResolvedValue(json({ id: 'a1' }, 201));

      await call('/things', schema, { name: 'Anna' });

      const [, init] = fetchMock.mock.calls[0];
      expect(init?.method).toBe(method);
      expect(init?.body).toBe('{"name":"Anna"}');
      expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
    });

    it('accepts an empty 204 response of a DELETE', async () => {
      fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

      await expect(apiDelete('/things/a1', noContentSchema)).resolves.toBeUndefined();
      expect(fetchMock.mock.calls[0][1]?.method).toBe('DELETE');
    });
  });

  describe('auth header seam', () => {
    it('adds the headers from the registered provider', async () => {
      setAuthHeaderProvider(async () => ({ Authorization: 'Bearer token' }));
      fetchMock.mockResolvedValue(json({ id: 'a1' }));

      await apiGet('/things/a1', schema);

      expect(fetchMock.mock.calls[0][1]?.headers).toMatchObject({ Authorization: 'Bearer token' });
    });

    it('sends no auth header when no provider is registered', async () => {
      fetchMock.mockResolvedValue(json({ id: 'a1' }));

      await apiGet('/things/a1', schema);

      expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
    });
  });

  describe('error responses', () => {
    it('throws an ApiError with the documented code for an ErrorResponse body', async () => {
      fetchMock.mockResolvedValue(
        json({ error: { code: 'NOT_FOUND', message: 'No such thing' } }, 404),
      );

      const error = await caught(apiGet('/things/x', schema));

      expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'No such thing' });
    });

    it('maps a code this build does not know to UNKNOWN', async () => {
      fetchMock.mockResolvedValue(json({ error: { code: 'FROM_THE_FUTURE', message: 'x' } }, 409));

      const error = await caught(apiGet('/things/x', schema));

      expect(error).toMatchObject({ status: 409, code: 'UNKNOWN' });
    });

    it('throws UNKNOWN for a non-JSON error body such as a proxy 502 page', async () => {
      fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));

      const error = await caught(apiGet('/things/x', schema));

      expect(error).toMatchObject({ status: 502, code: 'UNKNOWN' });
    });

    it('throws UNKNOWN for a JSON error body that is not an ErrorResponse', async () => {
      fetchMock.mockResolvedValue(json({ oops: true }, 500));

      const error = await caught(apiGet('/things/x', schema));

      expect(error).toMatchObject({ status: 500, code: 'UNKNOWN' });
    });

    it('keeps a 401 without a usable body distinguishable as UNAUTHENTICATED', async () => {
      fetchMock.mockResolvedValue(new Response('', { status: 401 }));

      const error = await caught(apiGet('/things/x', schema));

      expect(error).toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });
    });

    it('throws UNKNOWN when a 2xx body fails the schema', async () => {
      fetchMock.mockResolvedValue(json({ id: 42 }));

      const error = await caught(apiGet('/things/x', schema));

      expect(error).toMatchObject({ status: 200, code: 'UNKNOWN' });
    });
  });

  describe('network failures', () => {
    it('throws NETWORK_ERROR when fetch rejects', async () => {
      fetchMock.mockRejectedValue(new TypeError('Network request failed'));

      const error = await caught(apiGet('/things/x', schema));

      expect(error).toMatchObject({ status: 0, code: 'NETWORK_ERROR', reason: 'network' });
    });

    it('throws NETWORK_ERROR with reason timeout when the request takes too long', async () => {
      jest.useFakeTimers();
      fetchMock.mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      );

      const pending = caught(apiGet('/things/x', schema, { timeoutMs: 5_000 }));
      await jest.advanceTimersByTimeAsync(5_000);

      await expect(pending).resolves.toMatchObject({ code: 'NETWORK_ERROR', reason: 'timeout' });
    });

    it('does not time out a request that finishes in time', async () => {
      jest.useFakeTimers();
      fetchMock.mockResolvedValue(json({ id: 'a1' }));

      await expect(apiGet('/things/a1', schema, { timeoutMs: 5_000 })).resolves.toEqual({
        id: 'a1',
      });

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
