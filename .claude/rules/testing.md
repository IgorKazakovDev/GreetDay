---
paths:
  - '**/*.{spec,test}.{ts,tsx}'
  - 'apps/api/test/**'
  - '**/vitest.config.mts'
  - '**/jest.config.cts'
---

# Testing rules

## What to test, and where

| Code                  | Runner                      | Location                                             | Focus                                                                                                                   |
| --------------------- | --------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `libs/domain`         | Vitest                      | next to the file: `foo.spec.ts`                      | Every rule and edge case (Feb 29, year unknown, time zones, today/tomorrow boundaries). Table-driven tests (`it.each`). |
| `libs/contracts`      | Vitest                      | next to the schema                                   | Accepts valid and rejects invalid payloads, especially optional/nullable fields.                                        |
| `apps/api` routes     | Vitest + test DB            | `src/routes/<feature>/<feature>.integration.spec.ts` | Through `app.inject()`: happy path, validation error, not found, cross-user isolation.                                  |
| `apps/api` helpers    | Vitest                      | next to the file                                     | Pure logic only.                                                                                                        |
| `apps/mobile` screens | Jest + RNTL                 | `src/screens/<name>/<Name>Screen.spec.tsx`           | Loading, empty, error, success states, and the main interaction.                                                        |
| `libs/db`             | (via api integration tests) |                                                      | No mocks of Drizzle.                                                                                                    |

## Naming

- `describe('<unit under test>')`, `it('<does X> when <Y>')`. Read as a sentence: `it('returns 404 when the contact belongs to another user')`.
- One behaviour per `it`. Arrange / act / assert, separated by blank lines.

## Test database

- Integration tests use `TEST_DATABASE_URL` only (local `greetday_test`). `apps/api/test/global-setup.ts`
  migrates it once per run and refuses non-local hosts.
- Tests must not depend on each other's rows: create the data you need, clean up in `afterEach`
  (truncate the tables you touched) or use unique ids.
- Never point tests at the dev DB, and never mock the database in API integration tests.

## Mobile

- Query by role, label or text (`getByRole('button', { name: 'Save' })`), never by testID unless nothing else works.
- Mock the API at `src/api/client.ts` boundaries, not `fetch` internals.
- Wrap screens that use safe-area insets in `SafeAreaProvider` with `initialMetrics`.
- Never put tests under `src/app/`: Expo Router would treat them as routes.

## General

- Fix the code, not the test, unless the test is wrong. Say which in your summary.
- No snapshot tests for screens (they rot); assert on what the user sees.
- Run `pnpm nx affected -t test` before finishing.
