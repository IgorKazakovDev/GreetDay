import type { z } from 'zod';
import { errorResponseSchema, healthResponseSchema } from '@greetday/contracts';

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Fetches `path` and validates the JSON body with a schema from @greetday/contracts. */
export async function apiGet<S extends z.ZodType>(path: string, schema: S): Promise<z.infer<S>> {
  const res = await fetch(`${baseUrl}${path}`, { headers: { Accept: 'application/json' } });
  const json: unknown = await res.json().catch(() => undefined);
  if (!res.ok) {
    const parsed = errorResponseSchema.safeParse(json);
    throw parsed.success
      ? new ApiError(res.status, parsed.data.error.code, parsed.data.error.message)
      : new ApiError(res.status, 'UNKNOWN', `Request failed with ${res.status}`);
  }
  return schema.parse(json);
}

export const api = {
  health: () => apiGet('/health', healthResponseSchema),
};
