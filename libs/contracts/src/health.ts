import { z } from 'zod';

export const checkStatusSchema = z.enum(['ok', 'error']);

/** GET /health */
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  checks: z.object({
    database: checkStatusSchema,
  }),
  uptimeSeconds: z.number().nonnegative(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
