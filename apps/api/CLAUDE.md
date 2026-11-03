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

- All errors leave as `ErrorResponse`: `{ error: { code, message, details? } }`, and `code` is always
  one of `errorCodes` in [`libs/contracts/src/error-codes.ts`](../../libs/contracts/src/error-codes.ts).
  The mapping lives in one function, `toErrorResponse` in `src/errors.ts`, plugged in by `src/plugins/error-handler.ts`.
- In a route, `throw new AppError(errorCodes.NOT_FOUND)`. The code is typed, so a typo fails typecheck,
  and the HTTP status comes from `statusFor` in `src/errors.ts` (one canonical status per code, so
  "400 NOT_FOUND" can't happen). Only an `AppError` can choose a code; any other thrown error is
  mapped by its status alone.
- `new AppError(code, logMessage?)`: the optional log message is written to the log at `info`
  (`error` for `INTERNAL_ERROR`) together with the code. The client gets a fixed message per code,
  never the thrown text. **Log messages hold ids only, never personal data** (names, birthdays,
  usernames); see `.claude/rules/security.md`.
- Custom Zod error messages and `.refine` messages must not interpolate the submitted value: validation
  `details` are sent to the client.
- Fastify's own errors (415, 413, bad JSON) map by status to `BAD_REQUEST`; their `FST_ERR_*` codes never leave the API.
  Errors raised before routing (malformed `%`-encoded param, param over `maxParamLength`) skip
  `setErrorHandler`, so `buildApp` also passes `frameworkErrors` to `Fastify(...)`; keep it there.
- Validation failures become `400 VALIDATION_ERROR` automatically. 5xx becomes a generic `500 INTERNAL_ERROR`.
- Another user's resource is `404`, never `403`. There is no `FORBIDDEN` code; a stray 403 is answered as 404 and logged.

### When to add a new error code

- Add one only when the app should **behave differently** for it (show different copy, navigate, retry,
  refresh a token). If the client would treat it like an existing code, reuse that code.
- Name it `SCREAMING_SNAKE`. Feature codes are `<THING>_<PROBLEM>`, e.g. `CONTACT_NOT_FOUND`, `FRIEND_NOT_FOUND`.
- Contracts first: add it to `errorCodes` in `libs/contracts`, then add its fixed message to `messages`
  and its status to `statusFor` in `src/errors.ts` (typecheck fails until you do), then throw it with `AppError`, then add the app's copy.
- Codes are a public contract: never rename one or reuse it for a different meaning. Add a new code and stop sending the old one.
- Keep the status honest in `statusFor`: a "not found" code is 404, and never a 403 for another user's data.

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
