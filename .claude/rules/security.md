---
paths:
  - 'apps/api/**'
---

# API security rules

## Auth and data isolation

- Every route except `/health` (and future explicit public routes) requires an authenticated user.
  Public routes say so in a comment on the route.
- **Every query on user data is filtered by the authenticated user's id**, including reads by id,
  updates and deletes (`where(and(eq(t.id, id), eq(t.userId, user.id)))`). Fetching by id alone is a bug.
- Return `404` (not `403`) for another user's resources, so ids can't be probed.
- Every new route gets an integration test proving user A can't read or modify user B's data.

## Input validation

- Validate params, querystring, body and headers with Zod schemas from `@greetday/contracts`.
  No unvalidated `request.body` access, and no `as` casts on input.
- Bound everything: string `max()` lengths, array `max()` sizes, numeric ranges, pagination limits.
- Use Drizzle's query builder or `sql` template tag. Never build SQL by string concatenation.

## Output

- Always declare a response schema so serialization strips unknown fields (no leaking `userId`,
  internal flags or password hashes).
- 5xx responses never include stack traces or driver messages.

## Secrets and logging

- Secrets come from env vars validated in `src/env.ts`. Never hard-code them, never commit them, never log them.
- Never log request bodies, auth headers, tokens, or personal data (names, birthdays, phone numbers, emails).
  Log ids and counts.
- Don't read or print `.env` files.

## Dependencies and config

- Ask before adding a dependency. Prefer official `@fastify/*` plugins.
- CORS, rate limiting and security headers (`@fastify/cors`, `@fastify/rate-limit`, `@fastify/helmet`)
  get added with auth. Flag any route that is reachable without them once they exist.
