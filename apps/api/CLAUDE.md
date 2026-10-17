# apps/api: Fastify API

Fastify 5 + `fastify-type-provider-zod`, ESM, bundled by esbuild. Security rules load from
`.claude/rules/security.md`. Remember: explain backend changes to the developer (see root CLAUDE.md).

## Commands

```bash
docker compose up -d && pnpm nx run db:db:migrate   # DB first
pnpm nx serve api                                   # http://127.0.0.1:3000, rebuilds on change
pnpm nx test api                                    # unit + integration tests (needs Postgres)
pnpm nx build api                                   # apps/api/dist/main.js
```

## Structure

```
src/main.ts            Loads env (fails fast), builds the app, listens, handles SIGINT/SIGTERM
src/env.ts             Zod schema for every env var. Add new vars here AND to .env.example
src/app.ts             buildApp(config): compilers, plugins, route registration (no listen)
src/plugins/           Cross-cutting plugins (db, error handler, later auth)
src/routes/<feature>/  One Fastify plugin per feature: index.ts + *.integration.spec.ts
test/                  globalSetup (migrates test DB) and helpers (buildTestApp)
```

Add a feature by creating `src/routes/<feature>/index.ts` that exports a `FastifyPluginAsyncZod`
and registering it in `app.ts` with a prefix (e.g. `{ prefix: '/contacts' }`). No autoload.
Use the `/api-endpoint` skill.

## Contracts

- Request and response schemas come from `@greetday/contracts`, never defined inline in routes.
- Declare `schema: { params, querystring, body, response: { 200: …, 4xx: errorResponseSchema } }`
  so validation and serialization are both enforced (the response schema also stops extra fields leaking).
- Types come from the schemas (`z.infer`). No hand-written duplicates.

## Data access

- Use `app.db.db` (Drizzle) from the db plugin. No new `Pool`s.
- **Every query on user data is scoped to the authenticated user** (`where(eq(table.userId, request.user.id))`).
  A query without a user filter needs a comment explaining why.
- Keep business rules in `@greetday/domain`; routes orchestrate, they don't compute.

## Errors

- All errors leave as `ErrorResponse`: `{ error: { code, message, details? } }`. See `src/plugins/error-handler.ts`.
- Throw errors with `statusCode` and an UPPER_SNAKE `code` (e.g. `CONTACT_NOT_FOUND`) for 4xx.
- 5xx: the client gets a generic message and the details go to the log.
- Validation failures become `400 VALIDATION_ERROR` automatically.

## Logging

- Use `request.log` inside handlers and `app.log` elsewhere. Never `console.log`.
- Log ids and counts, not personal data (names, birthdays, phone numbers) or tokens.
  `authorization` and `cookie` headers are redacted.

## Integration tests

- Live next to the route: `src/routes/<feature>/<feature>.integration.spec.ts`.
- Use `buildTestApp()` from `test/helpers.ts` and `app.inject()`. Don't start a real server.
- They run against `TEST_DATABASE_URL`, which `test/global-setup.ts` migrates once. Each test
  creates the rows it needs and cleans up (truncate in `afterEach`, or use unique ids).
- Parse responses with the contract schema to prove the API honours it.
- Cover: happy path, validation error, not found, and **another user's data is not visible**.
