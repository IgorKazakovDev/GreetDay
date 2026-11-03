import { z } from 'zod';

/**
 * Shape of every non-2xx JSON response from the API.
 * `code` is deliberately a plain string (not the `ErrorCode` enum) so older apps tolerate codes
 * added later; known codes live in `error-codes.ts` (`isKnownErrorCode`).
 */
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
